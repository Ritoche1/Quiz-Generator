from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from database.database import get_db
from database.models import User
from app.routers.auth import get_current_user
from schemas.score import FriendshipCreate, FriendshipUpdateStatus
from schemas.friend import UserLite, FriendshipResponse, FriendListItem, PendingRequestItem, OutgoingRequestItem
from crud.user_crud import (
    create_friend_request,
    update_friend_request_status,
    delete_friendship,
    list_friends,
    list_pending_requests,
    list_outgoing_requests,
    search_users,
)
from crud.notification_crud import create_notification

router = APIRouter(prefix="/friends", tags=["friends"]) 

@router.get("/search", response_model=List[UserLite])
async def search(query: str = Query(..., min_length=1), db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = await search_users(db, query)
    # avoid returning sensitive info; include relationship hint later if needed
    return [UserLite.from_orm(u) for u in users if u.id != current_user.id]

@router.get("/pending", response_model=List[PendingRequestItem])
async def pending(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    reqs = await list_pending_requests(db, current_user.id)
    out: List[PendingRequestItem] = []
    for r in reqs:
        # fetch requester lite
        requester = await db.get(User, r.requester_id)
        out.append(PendingRequestItem(id=r.id, status=r.status, requester_user=UserLite.from_orm(requester)))
    return out

@router.get("/outgoing", response_model=List[OutgoingRequestItem])
async def outgoing(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    reqs = await list_outgoing_requests(db, current_user.id)
    out: List[OutgoingRequestItem] = []
    for r in reqs:
        addressee = await db.get(User, r.addressee_id)
        out.append(OutgoingRequestItem(id=r.id, status=r.status, addressee_user=UserLite.from_orm(addressee)))
    return out

@router.get("/list", response_model=List[FriendListItem])
async def friends_list(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    friends = await list_friends(db, current_user.id)
    out: List[FriendListItem] = []
    for fr in friends:
        other_id = fr.requester_id if fr.addressee_id == current_user.id else fr.addressee_id
        other = await db.get(User, other_id)
        out.append(FriendListItem(id=fr.id, status=fr.status, friend_user=UserLite.from_orm(other)))
    return out

@router.post("/request", response_model=FriendshipResponse)
async def request_friend(payload: FriendshipCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    fr = await create_friend_request(db, current_user.id, payload.addressee_id)
    if not fr:
        raise HTTPException(status_code=400, detail="Cannot create request (exists or invalid)")
    # If auto-accepted due to reverse pending, notify the original requester (other user)
    if fr.status == 'accepted':
        await create_notification(
            db,
            user_id=fr.requester_id,  # the user who had previously requested
            type="friend_accepted",
            actor_user_id=current_user.id,
            data={"friendship_id": fr.id, "by_username": current_user.username, "by_user_id": current_user.id}
        )
    else:
        # Otherwise, normal pending request: notify addressee
        await create_notification(
            db,
            user_id=payload.addressee_id,
            type="friend_request",
            actor_user_id=current_user.id,
            data={"friendship_id": fr.id, "from_username": current_user.username, "from_user_id": current_user.id}
        )
    return FriendshipResponse.from_orm(fr)

@router.post("/{friendship_id}/respond", response_model=FriendshipResponse)
async def respond(friendship_id: int, payload: FriendshipUpdateStatus, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.status not in ("accepted", "declined"):
        raise HTTPException(status_code=400, detail="Invalid status")
    fr = await update_friend_request_status(db, friendship_id, current_user.id, payload.status)
    if not fr:
        raise HTTPException(status_code=404, detail="Request not found or unauthorized")
    # Notify requester of decision, include actor name
    await create_notification(
        db,
        user_id=fr.requester_id,
        type=f"friend_{payload.status}",
        actor_user_id=current_user.id,
        data={"friendship_id": fr.id, "by_username": current_user.username, "by_user_id": current_user.id}
    )
    return FriendshipResponse.from_orm(fr)

@router.delete("/{friendship_id}")
async def remove(friendship_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    fr = await delete_friendship(db, friendship_id, current_user.id)
    if not fr:
        raise HTTPException(status_code=404, detail="Not found or unauthorized")
    return {"status": "success"}

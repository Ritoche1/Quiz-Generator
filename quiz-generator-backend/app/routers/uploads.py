from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(tags=["uploads"])


def _resolve_upload_file(folder: str, filename: str) -> Path | None:
    uploads_root = Path("/app/uploads")
    folder_path = uploads_root / folder
    requested = folder_path / filename

    if requested.is_file():
        return requested

    stem = Path(filename).stem
    for extension in ("jpg", "jpeg", "png", "webp", "gif"):
        candidate = folder_path / f"{stem}.{extension}"
        if candidate.is_file():
            return candidate

    return None


@router.get("/uploads/{folder}/{filename}")
@router.get("/api/uploads/{folder}/{filename}")
async def serve_upload(folder: str, filename: str):
    if folder not in {"avatars", "covers"}:
        raise HTTPException(status_code=404, detail="File not found")

    file_path = _resolve_upload_file(folder, filename)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
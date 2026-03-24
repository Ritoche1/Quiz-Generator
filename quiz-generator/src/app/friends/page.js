'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function FriendsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');
  const router = useRouter();

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` });

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) { router.push(`/?redirect=${encodeURIComponent('/friends')}`); return; }
    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => { setUser(u); refreshAll(); })
      .catch(() => router.push(`/?redirect=${encodeURIComponent('/friends')}`))
      .finally(() => setLoading(false));
  }, [router]);

  const refreshAll = async () => {
    try {
      const [fRes, pRes, oRes] = await Promise.all([
        fetch(`${baseUrl}/friends/list`, { headers: authHeader() }),
        fetch(`${baseUrl}/friends/pending`, { headers: authHeader() }),
        fetch(`${baseUrl}/friends/outgoing`, { headers: authHeader() }),
      ]);
      if (fRes.ok) setFriends(await fRes.json());
      if (pRes.ok) setPending(await pRes.json());
      if (oRes.ok) setOutgoing(await oRes.json());
    } catch {}
  };

  const search = async () => {
    if (!query.trim()) { setResults([]); return; }
    try {
      const res = await fetch(`${baseUrl}/friends/search?query=${encodeURIComponent(query)}`, { headers: authHeader() });
      if (res.ok) setResults(await res.json());
    } catch {}
  };

  const sendRequest = async (id) => {
    setBusy(true);
    try {
      const res = await fetch(`${baseUrl}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ addressee_id: id })
      });
      if (res.ok) { await refreshAll(); setResults(prev => prev.filter(u => u.id !== id)); }
    } catch {} finally { setBusy(false); }
  };

  const respond = async (id, status) => {
    setBusy(true);
    try {
      await fetch(`${baseUrl}/friends/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status })
      });
      await refreshAll();
    } catch {} finally { setBusy(false); }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await fetch(`${baseUrl}/friends/${id}`, { method: 'DELETE', headers: authHeader() });
      await refreshAll();
    } catch {} finally { setBusy(false); }
  };

  const friendIds = useMemo(() => new Set(friends.map(f => f?.friend_user?.id)), [friends]);
  const outgoingByUserId = useMemo(() => {
    const map = new Map();
    for (const o of outgoing) map.set(o?.addressee_user?.id, o);
    return map;
  }, [outgoing]);

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'requests', label: 'Requests', count: pending.length },
    { id: 'find', label: 'Find People' },
  ];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Friends</h1>
        <p className="text-gray-500">Connect and compete with friends</p>
      </div>

      <Card className="overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="p-6">
          {/* Friends list */}
          {activeTab === 'friends' && (
            friends.length === 0 ? (
              <EmptyState icon="👥" title="No friends yet" description="Search for people to connect with." action={
                <button onClick={() => setActiveTab('find')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Find People</button>
              } />
            ) : (
              <div className="space-y-3">
                {friends.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar username={f.friend_user?.username || ''} size="md" />
                      <div>
                        <div className="font-medium text-gray-900">{f.friend_user?.username}</div>
                        <div className="text-xs text-gray-500">{f.friend_user?.email}</div>
                      </div>
                    </div>
                    <button
                      disabled={busy}
                      onClick={() => remove(f.id)}
                      className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <>
              {pending.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Incoming</h3>
                  <div className="space-y-3">
                    {pending.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                        <div className="flex items-center gap-3">
                          <Avatar username={r.requester_user?.username || ''} size="md" />
                          <div>
                            <div className="font-medium text-gray-900">{r.requester_user?.username}</div>
                            <div className="text-xs text-gray-500">{r.requester_user?.email}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button disabled={busy} onClick={() => respond(r.id, 'accepted')} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Accept</button>
                          <button disabled={busy} onClick={() => respond(r.id, 'declined')} className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {outgoing.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Outgoing</h3>
                  <div className="space-y-3">
                    {outgoing.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Avatar username={o.addressee_user?.username || ''} size="md" />
                          <div>
                            <div className="font-medium text-gray-900">{o.addressee_user?.username}</div>
                            <div className="text-xs text-gray-500">{o.addressee_user?.email}</div>
                          </div>
                        </div>
                        <button disabled={busy} onClick={() => remove(o.id)} className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pending.length === 0 && outgoing.length === 0 && (
                <EmptyState icon="📬" title="No requests" description="You have no pending friend requests." />
              )}
            </>
          )}

          {/* Find */}
          {activeTab === 'find' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Search by username or email..."
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
                <button onClick={search} className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Search
                </button>
              </div>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map(u => {
                    const isFriend = friendIds.has(u.id);
                    const outReq = outgoingByUserId.get(u.id);
                    return (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar username={u.username} size="md" />
                          <div>
                            <div className="font-medium text-gray-900">{u.username}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                        {isFriend ? (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Friends</span>
                        ) : outReq ? (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">Requested</span>
                        ) : (
                          <button disabled={busy} onClick={() => sendRequest(u.id)} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon="🔍" title="Search for people" description="Enter a username or email to find friends." />
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

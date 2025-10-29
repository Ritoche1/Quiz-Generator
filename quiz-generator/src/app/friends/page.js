'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function FriendsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]); // [{ id, status, friend_user: { id, username, email } }]
  const [pending, setPending] = useState([]); // [{ id, status, requester_user: { ... } }]
  const [outgoing, setOutgoing] = useState([]); // [{ id, status, addressee_user: { ... } }]
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) {
      const ret = encodeURIComponent('/friends');
      router.push(`/?redirect=${ret}`);
      return;
    }
    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('auth'))
      .then(u => { setUser(u); refreshAll(); })
      .catch(() => { const ret = encodeURIComponent('/friends'); router.push(`/?redirect=${ret}`); })
      .finally(() => setLoading(false));
  }, [router]);

  const refreshAll = async () => {
    const token = localStorage.getItem('quizToken');
    try {
      const [fRes, pRes, oRes] = await Promise.all([
        fetch(`${baseUrl}/friends/list`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/friends/pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${baseUrl}/friends/outgoing`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      if (fRes.ok) setFriends(await fRes.json());
      if (pRes.ok) setPending(await pRes.json());
      if (oRes.ok) setOutgoing(await oRes.json());
    } catch (e) { console.error(e); }
  };

  const search = async () => {
    if (!query.trim()) return setResults([]);
    try {
      const res = await fetch(`${baseUrl}/friends/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` }
      });
      if (res.ok) setResults(await res.json());
    } catch (e) { console.error(e); }
  };

  const sendRequest = async (addresseeId) => {
    setBusy(true);
    try {
      const res = await fetch(`${baseUrl}/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addressee_id: addresseeId })
      });
      if (res.ok) {
        await refreshAll();
        setResults(prev => prev.filter(u => u.id !== addresseeId));
      }
    } catch (e) { console.error(e); }
    finally { setBusy(false); }
  };

  const respond = async (friendshipId, status) => {
    setBusy(true);
    try {
      const res = await fetch(`${baseUrl}/friends/${friendshipId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) await refreshAll();
    } catch (e) { console.error(e); }
    finally { setBusy(false); }
  };

  const remove = async (friendshipId, message = 'Remove this friend?') => {
    if (!confirm(message)) return;
    setBusy(true);
    try {
      const res = await fetch(`${baseUrl}/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` }
      });
      if (res.ok) await refreshAll();
    } catch (e) { console.error(e); }
    finally { setBusy(false); }
  };

  const friendIds = useMemo(() => new Set(friends.map(f => f?.friend_user?.id)), [friends]);
  const outgoingByUserId = useMemo(() => {
    const map = new Map();
    for (const o of outgoing) map.set(o?.addressee_user?.id, o);
    return map;
  }, [outgoing]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="loading-spinner mx-auto mb-3" />
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24 safe-bottom">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">🤝 Friends</h1>
            <p className="text-white/80">Connect and compete with friends</p>
          </div>

          {/* Search */}
          <div className="glass-card p-4 rounded-2xl mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Add friends</h2>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Search by username or email"
                className="form-input flex-1"
                aria-label="Search users"
              />
              <button onClick={search} className="btn-primary px-4 py-2">Search</button>
            </div>
            {results.length > 0 && (
              <div className="mt-4 space-y-2">
                {results.map(u => {
                  const isFriend = friendIds.has(u.id);
                  const outgoingReq = outgoingByUserId.get(u.id);
                  return (
                    <div key={u.id} className="card p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{u.username}</div>
                        <div className="text-xs text-gray-600">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isFriend ? (
                          <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">Friends</span>
                        ) : outgoingReq ? (
                          <>
                            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">Requested</span>
                            <button disabled={busy} onClick={() => remove(outgoingReq.id, 'Cancel this request?')} className="btn-ghost-light px-3 py-2 text-sm">Cancel</button>
                          </>
                        ) : (
                          <button disabled={busy} onClick={() => sendRequest(u.id)} className="btn-ghost-light px-3 py-2 text-sm">Add</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending */}
          <div className="glass-card p-4 rounded-2xl mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Pending requests</h2>
            {pending.length === 0 ? (
              <div className="text-gray-600 text-sm">No pending requests.</div>
            ) : (
              <div className="space-y-2">
                {pending.map(r => (
                  <div key={r.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{r.requester_user?.username}</div>
                      <div className="text-xs text-gray-600">{r.requester_user?.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => respond(r.id, 'accepted')} className="btn-primary px-3 py-2 text-sm">Accept</button>
                      <button disabled={busy} onClick={() => respond(r.id, 'declined')} className="btn-ghost-light px-3 py-2 text-sm">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div className="glass-card p-4 rounded-2xl mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Outgoing requests</h2>
            {outgoing.length === 0 ? (
              <div className="text-gray-600 text-sm">No outgoing requests.</div>
            ) : (
              <div className="space-y-2">
                {outgoing.map(o => (
                  <div key={o.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{o.addressee_user?.username}</div>
                      <div className="text-xs text-gray-600">{o.addressee_user?.email}</div>
                    </div>
                    <button disabled={busy} onClick={() => remove(o.id, 'Cancel this request?')} className="btn-ghost-light px-3 py-2 text-sm">Cancel</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends */}
          <div className="glass-card p-4 rounded-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Your friends</h2>
            {friends.length === 0 ? (
              <div className="text-gray-600 text-sm">No friends yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map(f => (
                  <div key={f.id} className="card p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{f.friend_user?.username}</div>
                      <div className="text-xs text-gray-600">{f.friend_user?.email}</div>
                    </div>
                    <button disabled={busy} onClick={() => remove(f.id)} className="btn-ghost-light px-3 py-2 text-sm text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

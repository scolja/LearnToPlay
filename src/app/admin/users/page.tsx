'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  picture: string | null;
  roles: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const isAdmin = !!user && user.roles.includes('admin');

  const fetchUsers = useCallback(async (searchTerm?: string) => {
    try {
      const qs = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await fetch(`/api/admin/users${qs}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError('Access denied');
          return;
        }
        throw new Error('Failed to load users');
      }
      const data = await res.json();
      setUsers(data.users);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [authLoading, isAdmin, fetchUsers]);

  // Debounced search
  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isAdmin, fetchUsers]);

  const toggleRole = async (userId: string, role: string, currentRoles: string[]) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    setSaving(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: newRoles }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update roles');
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u))
      );
      setError('');
    } catch {
      setError('Failed to update roles');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (userId: string, currentActive: boolean) => {
    setSaving(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update status');
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u))
      );
      setError('');
    } catch {
      setError('Failed to update status');
    } finally {
      setSaving(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="au-page">
        <div className="au-topbar">
          <div className="au-topbar-title">Users</div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="au-skeleton">
            <div className="au-skeleton-avatar" />
            <div className="au-skeleton-lines">
              <div className="au-skeleton-line" />
              <div className="au-skeleton-line" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Access denied
  if (!isAdmin) {
    return (
      <div className="au-page">
        <div className="au-denied">
          <svg className="au-denied-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h1 className="au-denied-title">Access Denied</h1>
          <p className="au-denied-text">
            You need administrator privileges to manage users.
          </p>
          <Link href="/" className="au-denied-link">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="au-page">
      {/* Sticky header */}
      <div className="au-header">
        <div className="au-topbar">
          <span className="au-topbar-title">Manage Users</span>
          <span className="au-topbar-count">{users.length} users</span>
        </div>

        {/* Search */}
        <div className="au-search-wrap">
          <svg className="au-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="au-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {error && <div className="au-error">{error}</div>}

      {/* User list */}
      <div className="au-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="au-skeleton">
              <div className="au-skeleton-avatar" />
              <div className="au-skeleton-lines">
                <div className="au-skeleton-line" />
                <div className="au-skeleton-line" />
              </div>
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="au-empty">
            {search ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          users.map((u) => {
            const isExpanded = expandedId === u.id;
            const isSelf = u.id === user?.id;

            return (
              <div
                key={u.id}
                className={`au-user${!u.isActive ? ' au-user-inactive' : ''}`}
              >
                {/* Clickable row */}
                <div
                  className="au-user-row"
                  onClick={() => setExpandedId(isExpanded ? null : u.id)}
                >
                  {u.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.picture}
                      alt=""
                      className="au-avatar"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="au-avatar-placeholder">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}

                  <div className="au-user-info">
                    <span className="au-user-name">
                      {u.displayName}
                      {isSelf ? ' (you)' : ''}
                    </span>
                    <span className="au-user-email">{u.email}</span>
                  </div>

                  <div className="au-badges">
                    {u.roles.includes('admin') && (
                      <span className="au-badge au-badge-admin">Admin</span>
                    )}
                    {u.roles.includes('editor') && (
                      <span className="au-badge au-badge-editor">Editor</span>
                    )}
                    {!u.isActive && (
                      <span className="au-badge au-badge-inactive">Off</span>
                    )}
                  </div>

                  <svg
                    className={`au-chevron${isExpanded ? ' au-chevron-open' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>

                {/* Expandable panel */}
                <div className={`au-expand${isExpanded ? ' au-expand-open' : ''}`}>
                  <div className="au-expand-inner">
                    {saving === u.id && (
                      <div className="au-saving">Saving...</div>
                    )}

                    {/* Roles */}
                    <div className="au-control-group">
                      <div className="au-control-label">Roles</div>
                      <div className="au-toggles">
                        <button
                          type="button"
                          className={`au-toggle-btn${u.roles.includes('editor') ? ' au-toggle-on' : ''}`}
                          onClick={() => toggleRole(u.id, 'editor', u.roles)}
                          disabled={saving === u.id}
                        >
                          <span className="au-toggle-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </span>
                          Editor
                        </button>
                        <button
                          type="button"
                          className={`au-toggle-btn${u.roles.includes('admin') ? ' au-toggle-on' : ''}${isSelf && u.roles.includes('admin') ? ' au-toggle-danger' : ''}`}
                          onClick={() => toggleRole(u.id, 'admin', u.roles)}
                          disabled={saving === u.id || (isSelf && u.roles.includes('admin'))}
                          title={isSelf && u.roles.includes('admin') ? "Can't remove your own admin role" : undefined}
                        >
                          <span className="au-toggle-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </span>
                          Admin
                        </button>
                      </div>
                    </div>

                    {/* Active status */}
                    <div className="au-control-group">
                      <div className="au-control-label">Account Status</div>
                      <button
                        type="button"
                        className={`au-active-toggle${u.isActive ? ' au-active-on' : ' au-active-off'}`}
                        onClick={() => toggleActive(u.id, u.isActive)}
                        disabled={saving === u.id || isSelf}
                        title={isSelf ? "Can't deactivate your own account" : undefined}
                      >
                        <span>{u.isActive ? 'Active' : 'Deactivated'}</span>
                        <div className={`au-switch${u.isActive ? ' au-switch-on' : ''}`} />
                      </button>
                    </div>

                    {/* Meta info */}
                    <div className="au-meta">
                      <div className="au-meta-row">
                        <span>Last login</span>
                        <span className="au-meta-value">{formatDate(u.lastLoginAt)}</span>
                      </div>
                      <div className="au-meta-row">
                        <span>Created</span>
                        <span className="au-meta-value">{formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AdminBottomNav activeTab="users" />
    </div>
  );
}

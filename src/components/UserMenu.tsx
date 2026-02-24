'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function UserMenu() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login" className="user-menu-login">
        Sign In
      </Link>
    );
  }

  return (
    <div className="user-menu">
      {user.picture && (
        <img src={user.picture} alt="" className="user-menu-avatar" referrerPolicy="no-referrer" />
      )}
      <span className="user-menu-name">{user.name}</span>
      {user.roles.length > 0 && (
        <span className="user-menu-roles">
          {user.roles.map(role => (
            <span key={role} className={`user-menu-role user-menu-role-${role}`}>{role}</span>
          ))}
        </span>
      )}
      <button onClick={logout} className="user-menu-logout">
        Sign Out
      </button>
    </div>
  );
}

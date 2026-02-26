'use client';

import Link from 'next/link';

interface AdminBottomNavProps {
  activeTab: 'home' | 'users';
}

export function AdminBottomNav({ activeTab }: AdminBottomNavProps) {
  return (
    <nav className="au-bottombar">
      <Link href="/" className="au-tab">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l9-8 9 8" />
          <path d="M5 10v10h5v-6h4v6h5V10" />
        </svg>
        <span>Home</span>
      </Link>

      <Link
        href="/admin/users"
        className={`au-tab${activeTab === 'users' ? ' au-tab-active' : ''}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Users</span>
      </Link>
    </nav>
  );
}

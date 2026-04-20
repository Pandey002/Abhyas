"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand-section">
          <Link href="/" className="brand-grand">
            <div className="brand-mark-wrapper">
              <div className="brand-diamond"></div>
              <span className="brand-text">Abhyas</span>
            </div>
          </Link>
        </div>
        
        <nav className="nav">
          <Link href="/library" className={isActive('/library') ? 'active' : ''}>Library</Link>
          <Link href="/upload" className={isActive('/upload') ? 'active' : ''}>Upload</Link>
        </nav>
        
        <div className="user-section">
          <Link href="/" className={isActive('/') ? 'active-icon' : ''}>
            <Home size={24} strokeWidth={1.5} />
          </Link>
          <Link href="/profile" className={isActive('/profile') ? 'active-icon' : ''}>
            <User size={24} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

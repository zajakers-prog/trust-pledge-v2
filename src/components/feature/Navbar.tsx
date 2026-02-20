"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStorage } from '@/lib/store';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, myCredits, isLoading, logout } = useStorage();

    // Hide navbar on login page
    if (pathname === '/login') return null;

    // Protect routes - redirect to login if not authenticated
    // We do this effect here or in a separate AuthGuard. 
    // Navbar is a convenient place since it's always rendered.
    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, isLoading, pathname, router]);

    if (!user) return null; // Don't show navbar content if not logged in (and redirecting)

    const totalCredits = myCredits.reduce((sum, c) => sum + c.pcAmount, 0);

    const isActive = (path: string) => pathname === path ? 'active' : '';

    return (
        <nav id="mainNav">
            <div className="nav-inner">
                <Link href="/" className="logo">TrustPledge<span>.io</span></Link>
                <div className="nav-links">
                    <Link href="/">
                        <button className={isActive('/')}>Home</button>
                    </Link>
                    <Link href="/contributor">
                        <button className={isActive('/contributor')}>Marketplace</button>
                    </Link>
                    <Link href="/credits">
                        <button className={isActive('/credits')}>My Credits</button>
                    </Link>
                    <Link href="/dashboard">
                        <button className={isActive('/dashboard')}>내 대시보드</button>
                    </Link>
                    <Link href="/maker">
                        <button className={`btn-cta-nav ${isActive('/maker')}`}>프로젝트 등록</button>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/credits" className="nav-user">
                            <div className="nav-user-avatar">
                                {user.avatar.length > 2 ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    user.avatar
                                )}
                            </div>
                            <div>
                                <div className="nav-user-name">{user.name}</div>
                                <div className="nav-user-credits">
                                    <span className="pc-icon" style={{ width: '14px', height: '14px', fontSize: '0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-credit)', borderRadius: '50%', color: '#1a1a1a' }}>PC</span>
                                    <span>{totalCredits.toLocaleString()} PC</span>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

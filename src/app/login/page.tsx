"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useStorage } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function LoginPage() {
    const { login } = useStorage();
    const router = useRouter();
    const [guestName, setGuestName] = useState('');

    const handleLogin = (provider: 'google' | 'apple') => {
        // Attempt NextAuth login
        signIn(provider, { callbackUrl: '/' });
    };

    const handleGuestLogin = () => {
        if (!guestName.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        login('guest', guestName);
        router.push('/');
    };

    return (
        <div className="login-wrapper">
            <Card className="login-card">
                <div className="login-logo">TrustPledge<span style={{ fontWeight: 400, opacity: 0.5 }}>.io</span></div>
                <p className="login-tagline">초기 기여자의 보상을 기술로 보증하는 플랫폼</p>

                <button className="oauth-btn" onClick={() => handleLogin('google')}>
                    <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google로 계속하기
                </button>

                <button className="oauth-btn" onClick={() => handleLogin('apple')}>
                    <svg viewBox="0 0 24 24"><path fill="white" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                    Apple로 계속하기
                </button>

                <div className="login-divider">또는</div>

                <Input
                    type="text"
                    placeholder="이름을 입력하세요 (게스트 체험)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="mb-3"
                />

                <Button variant="secondary" onClick={handleGuestLogin} style={{ width: '100%' }}>
                    게스트로 둘러보기
                </Button>

                <div className="login-footer">
                    로그인 시 <strong style={{ color: 'var(--text-primary)' }}>이용약관</strong> 및&nbsp;
                    <strong style={{ color: 'var(--text-primary)' }}>개인정보처리방침</strong>에 동의하게 됩니다.
                </div>
            </Card>
        </div>
    );
}

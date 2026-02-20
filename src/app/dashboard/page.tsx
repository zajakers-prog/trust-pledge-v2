"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface Contribution {
    id: string;
    project_id: string;
    project_name: string;
    user_email: string;
    user_name: string;
    pc_amount: number;
    pc_value: string;
    proof: string | null;
    status: 'pending' | 'approved' | 'rejected';
    earned_at: string;
    reject_reason?: string;
}

interface Project {
    id: string;
    name: string;
    status: string;
    currentMemberCount: number;
    targetMemberCount: number;
    totalPC: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending');
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const userEmail = session?.user?.email || '';

    const fetchData = useCallback(async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            const [projRes, contribRes] = await Promise.all([
                fetch(`/api/projects?makerEmail=${encodeURIComponent(userEmail)}`),
                fetch(`/api/contributions?makerEmail=${encodeURIComponent(userEmail)}&status=${activeTab === 'pending' ? 'pending' : 'all'}`),
            ]);
            const projData = await projRes.json();
            const contribData = await contribRes.json();
            if (Array.isArray(projData)) setProjects(projData);
            if (Array.isArray(contribData)) setContributions(contribData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userEmail, activeTab]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status, fetchData]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/contributions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            });
            if (res.ok) {
                setContributions(prev =>
                    prev.map(c => c.id === id ? { ...c, status: 'approved' } : c)
                );
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectModal || !rejectReason.trim()) return;
        setActionLoading(rejectModal.id);
        try {
            const res = await fetch(`/api/contributions/${rejectModal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', rejectReason }),
            });
            if (res.ok) {
                setContributions(prev =>
                    prev.map(c => c.id === rejectModal.id ? { ...c, status: 'rejected' } : c)
                );
                setRejectModal(null);
                setRejectReason('');
            }
        } finally {
            setActionLoading(null);
        }
    };

    const pendingCount = contributions.filter(c => c.status === 'pending').length;

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--gray-400)' }}>로딩 중...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
            {/* 헤더 */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>창업자 대시보드</h1>
                <p style={{ color: 'var(--gray-400)' }}>{session?.user?.name}님의 프로젝트를 관리하세요.</p>
            </div>

            {/* 내 프로젝트 현황 */}
            <section style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>내 프로젝트</h2>
                {projects.length === 0 ? (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <p style={{ color: 'var(--gray-400)', marginBottom: 16 }}>아직 등록한 프로젝트가 없습니다.</p>
                            <Button variant="primary" onClick={() => router.push('/maker')}>
                                프로젝트 등록하기
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {projects.map(proj => (
                            <Card key={proj.id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <span style={{ fontWeight: 600, fontSize: 16 }}>{proj.name}</span>
                                        <div style={{ marginTop: 4, color: 'var(--gray-400)', fontSize: 13 }}>
                                            기여자 {proj.currentMemberCount} / {proj.targetMemberCount}명
                                        </div>
                                    </div>
                                    <Badge
                                        label={proj.status === 'active' ? '모집중' : proj.status === 'completed' ? '완료' : '취소'}
                                        color={proj.status === 'active' ? 'green' : proj.status === 'completed' ? 'blue' : 'red'}
                                    />
                                </div>
                                {/* 진행률 바 */}
                                <div style={{ marginTop: 12, background: 'var(--gray-100)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        background: 'var(--blue-500)',
                                        width: `${Math.min(100, Math.round(proj.currentMemberCount / proj.targetMemberCount * 100))}%`,
                                        transition: 'width 0.3s',
                                    }} />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* 기여 신청 관리 */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>기여 신청 관리</h2>
                    {pendingCount > 0 && (
                        <span style={{
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: 99,
                            padding: '2px 8px',
                            fontSize: 12,
                            fontWeight: 700,
                        }}>
                            {pendingCount}건 대기중
                        </span>
                    )}
                </div>

                {/* 탭 */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {(['pending', 'all'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: 8,
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: 14,
                                background: activeTab === tab ? 'var(--blue-500)' : 'var(--gray-100)',
                                color: activeTab === tab ? 'white' : 'var(--gray-600)',
                            }}
                        >
                            {tab === 'pending' ? '대기중' : '전체'}
                        </button>
                    ))}
                </div>

                {contributions.length === 0 ? (
                    <Card>
                        <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '24px 0' }}>
                            {activeTab === 'pending' ? '대기중인 기여 신청이 없습니다.' : '기여 신청 내역이 없습니다.'}
                        </p>
                    </Card>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {contributions.map(c => (
                            <Card key={c.id}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.user_name}</div>
                                        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 4 }}>{c.user_email}</div>
                                        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>
                                            프로젝트: {c.project_name}
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>
                                            PC: {c.pc_amount.toLocaleString()} PC (1PC = {parseFloat(c.pc_value).toLocaleString()}원)
                                        </div>
                                        {c.proof && (
                                            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>
                                                <strong>기여 증빙:</strong> {c.proof}
                                            </div>
                                        )}
                                        {c.reject_reason && (
                                            <div style={{ fontSize: 13, color: '#ef4444', marginTop: 8 }}>
                                                <strong>거절 사유:</strong> {c.reject_reason}
                                            </div>
                                        )}
                                        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
                                            {new Date(c.earned_at).toLocaleString('ko-KR')}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                        {c.status === 'pending' ? (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleApprove(c.id)}
                                                    disabled={actionLoading === c.id}
                                                >
                                                    {actionLoading === c.id ? '처리중...' : '승인'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setRejectModal({ id: c.id, name: c.user_name })}
                                                    disabled={actionLoading === c.id}
                                                    style={{ color: '#ef4444' }}
                                                >
                                                    거절
                                                </Button>
                                            </>
                                        ) : (
                                            <Badge
                                                label={c.status === 'approved' ? '승인됨' : '거절됨'}
                                                color={c.status === 'approved' ? 'green' : 'red'}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* 거절 사유 모달 */}
            {rejectModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        background: 'white', borderRadius: 16, padding: 32,
                        maxWidth: 480, width: '90%',
                    }}>
                        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>기여 거절</h3>
                        <p style={{ color: 'var(--gray-500)', marginBottom: 16 }}>
                            <strong>{rejectModal.name}</strong>님의 기여 신청을 거절합니다.<br />
                            거절 사유를 입력해주세요. (기여자에게 이메일로 전달됩니다)
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="예: 제출하신 증빙 자료가 기준에 맞지 않습니다."
                            style={{
                                width: '100%', minHeight: 100, padding: 12,
                                border: '1px solid var(--gray-200)', borderRadius: 8,
                                fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                            <Button variant="ghost" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                                취소
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleRejectConfirm}
                                disabled={!rejectReason.trim() || !!actionLoading}
                                style={{ background: '#ef4444' }}
                            >
                                거절 확인
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

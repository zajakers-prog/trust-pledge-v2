"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Stats {
    totalProjects: number;
    activeProjects: number;
    totalContributions: number;
    pendingContributions: number;
    approvedContributions: number;
    rejectedContributions: number;
}

interface ProjectRow {
    id: string;
    name: string;
    maker: string;
    maker_email: string;
    status: string;
    current_member_count: number;
    target_member_count: number;
    created_at: string;
}

interface ContributionRow {
    id: string;
    project_name: string;
    user_name: string;
    user_email: string;
    pc_amount: number;
    status: string;
    earned_at: string;
}

export default function AdminPage() {
    const [secret, setSecret] = useState('');
    const [inputSecret, setInputSecret] = useState('');
    const [stats, setStats] = useState<Stats | null>(null);
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [contributions, setContributions] = useState<ContributionRow[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'contributions'>('overview');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async (s: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(s)}`);
            if (!res.ok) {
                setError('인증 실패: 관리자 코드가 올바르지 않습니다.');
                return;
            }
            const data = await res.json();
            setStats(data.stats);
            setProjects(data.projects);
            setContributions(data.contributions);
            setSecret(s);
        } catch {
            setError('데이터 로드 실패');
        } finally {
            setLoading(false);
        }
    };

    if (!secret) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card style={{ width: 360, padding: 32 }}>
                    <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>관리자 대시보드</h2>
                    <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 20 }}>접근 코드를 입력하세요.</p>
                    {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{error}</p>}
                    <input
                        type="password"
                        value={inputSecret}
                        onChange={e => setInputSecret(e.target.value)}
                        placeholder="관리자 코드"
                        onKeyDown={e => e.key === 'Enter' && fetchData(inputSecret)}
                        style={{
                            width: '100%', padding: '10px 12px', border: '1px solid var(--gray-200)',
                            borderRadius: 8, fontSize: 15, marginBottom: 12, boxSizing: 'border-box',
                        }}
                    />
                    <Button
                        variant="primary"
                        onClick={() => fetchData(inputSecret)}
                        disabled={loading || !inputSecret}
                        style={{ width: '100%' }}
                    >
                        {loading ? '로딩 중...' : '확인'}
                    </Button>
                </Card>
            </div>
        );
    }

    const statCards = stats ? [
        { label: '전체 프로젝트', value: stats.totalProjects, sub: `활성: ${stats.activeProjects}개`, color: '#2563eb' },
        { label: '전체 기여 신청', value: stats.totalContributions, sub: `대기: ${stats.pendingContributions}건`, color: '#f59e0b' },
        { label: '승인된 기여', value: stats.approvedContributions, sub: `거절: ${stats.rejectedContributions}건`, color: '#16a34a' },
        { label: '승인율', value: stats.totalContributions ? `${Math.round(stats.approvedContributions / stats.totalContributions * 100)}%` : '-', sub: '승인 / 전체', color: '#8b5cf6' },
    ] : [];

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>관리자 대시보드</h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>TrustPledge 플랫폼 전체 현황</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSecret('')}>로그아웃</Button>
            </div>

            {/* 통계 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {statCards.map(card => (
                    <Card key={card.label}>
                        <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 8 }}>{card.label}</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{card.sub}</div>
                    </Card>
                ))}
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {([['overview', '요약'], ['projects', '프로젝트'], ['contributions', '기여 신청']] as const).map(([tab, label]) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontWeight: 500, fontSize: 14,
                            background: activeTab === tab ? 'var(--blue-500)' : 'var(--gray-100)',
                            color: activeTab === tab ? 'white' : 'var(--gray-600)',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 프로젝트 목록 */}
            {activeTab === 'projects' && (
                <div style={{ display: 'grid', gap: 12 }}>
                    {projects.map(proj => (
                        <Card key={proj.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{proj.name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                                        창업자: {proj.maker} ({proj.maker_email || '이메일 없음'})
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                                        기여자 {proj.current_member_count}/{proj.target_member_count}명 | 등록일: {new Date(proj.created_at).toLocaleDateString('ko-KR')}
                                    </div>
                                </div>
                                <Badge
                                    label={proj.status === 'active' ? '활성' : proj.status === 'completed' ? '완료' : '취소'}
                                    color={proj.status === 'active' ? 'green' : proj.status === 'completed' ? 'blue' : 'red'}
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 기여 신청 목록 */}
            {activeTab === 'contributions' && (
                <div style={{ display: 'grid', gap: 12 }}>
                    {contributions.map(c => (
                        <Card key={c.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.user_name}</div>
                                    <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                                        {c.user_email} | 프로젝트: {c.project_name}
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                                        PC: {c.pc_amount.toLocaleString()}개 | {new Date(c.earned_at).toLocaleString('ko-KR')}
                                    </div>
                                </div>
                                <Badge
                                    label={c.status === 'pending' ? '대기중' : c.status === 'approved' ? '승인' : '거절'}
                                    color={c.status === 'pending' ? 'amber' : c.status === 'approved' ? 'green' : 'red'}
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 요약 탭 */}
            {activeTab === 'overview' && (
                <Card>
                    <h3 style={{ fontWeight: 600, marginBottom: 16 }}>최근 활동</h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {contributions.slice(0, 10).map(c => (
                            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                <div>
                                    <span style={{ fontWeight: 500 }}>{c.user_name}</span>
                                    <span style={{ color: 'var(--gray-400)', fontSize: 13 }}> → {c.project_name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                                        {new Date(c.earned_at).toLocaleDateString('ko-KR')}
                                    </span>
                                    <Badge
                                        label={c.status === 'pending' ? '대기' : c.status === 'approved' ? '승인' : '거절'}
                                        color={c.status === 'pending' ? 'amber' : c.status === 'approved' ? 'green' : 'red'}
                                    />
                                </div>
                            </div>
                        ))}
                        {contributions.length === 0 && (
                            <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '16px 0' }}>아직 기여 신청이 없습니다.</p>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

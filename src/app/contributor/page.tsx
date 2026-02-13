"use client";

import React, { useState } from 'react';
import { useStorage } from '@/lib/store';
import { Project, SettlementCondition } from '@/lib/types';
import ProjectCard from '@/components/feature/ProjectCard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const condLabels: Record<SettlementCondition, string> = {
    revenue: '첫 수익 발생 시',
    funding: '투자 유치 시',
    milestone: '마일스톤 달성 시',
    exit: 'Exit 시'
};

export default function ContributorPage() {
    const { projects, user, joinProject, myCredits } = useStorage();
    const [filter, setFilter] = useState<'all' | 'high' | 'closing'>('all');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [proofInput, setProofInput] = useState('');

    const filteredProjects = projects.filter(p => {
        if (filter === 'high') return p.pcValue >= 0.50;
        if (filter === 'closing') {
            const days = Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days <= 30 && days > 0;
        }
        return true;
    });

    const handleJoin = () => {
        if (selectedProject) {
            if (!user) {
                alert('로그인이 필요합니다.');
                return;
            }
            // Check if already joined manually to debug
            const alreadyJoined = myCredits.some(c => c.projectId === selectedProject.id);
            if (alreadyJoined) {
                alert('이미 참여한 프로젝트입니다.');
                return;
            }

            if (selectedProject.proofDescription && !proofInput.trim()) {
                alert('기여 증빙(아이디/스크린샷 등)을 입력해주세요.');
                return;
            }

            joinProject(selectedProject.id, proofInput);
            alert('참여가 완료되었습니다! PC가 발급되었습니다.');
            setSelectedProject(null); // Close modal to reflect updates in the list
            setProofInput('');
        }
    };

    const perPC = selectedProject ? Math.floor(selectedProject.totalPC / selectedProject.targetMemberCount) : 0;
    const perUSD = selectedProject ? (perPC * selectedProject.pcValue).toFixed(2) : '0.00';
    const isJoined = selectedProject && myCredits.some(c => c.projectId === selectedProject.id);
    const isFull = selectedProject && selectedProject.currentMemberCount >= selectedProject.targetMemberCount;

    // Reset proof input when modal opens
    /* Effect or wrapper needed if using just state. 
       Simple way: clear it when setting selectedProject if not null, or on close.
       Let's clear on open. */
    const openModal = (p: Project) => {
        setProofInput('');
        setSelectedProject(p);
    };

    return (
        <div className="view active" style={{ display: 'block', minHeight: '100vh', paddingTop: '80px' }}>
            <div className="container py-8">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="section-title">프로젝트 Marketplace</h2>
                        <p className="section-subtitle mb-0">Pledge Credit이 보장된 초기 기여 기회를 찾아보세요.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${filter === 'all' ? 'text-[var(--accent-blue)] border-[var(--accent-blue)] bg-blue-500/10' : 'text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                            onClick={() => setFilter('all')}
                        >
                            전체
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${filter === 'high' ? 'text-[var(--accent-blue)] border-[var(--accent-blue)] bg-blue-500/10' : 'text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                            onClick={() => setFilter('high')}
                        >
                            고가치 PC
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${filter === 'closing' ? 'text-[var(--accent-blue)] border-[var(--accent-blue)] bg-blue-500/10' : 'text-[var(--text-secondary)] border-[var(--border-color)]'}`}
                            onClick={() => setFilter('closing')}
                        >
                            마감 임박
                        </button>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                        <h3>조건에 맞는 프로젝트가 없습니다</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
                        {filteredProjects.map(p => (
                            <ProjectCard key={p.id} project={p} onClick={() => openModal(p)} />
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                title={selectedProject?.name}
                footer={
                    <div className="flex flex-col w-full gap-3">
                        {selectedProject && !isJoined && !isFull && (
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                                <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                                    기여 활동 수행
                                </h4>
                                {selectedProject.contributionLink && (
                                    <a
                                        href={selectedProject.contributionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary w-full mb-3 text-sm justify-center"
                                    >
                                        외부 사이트로 이동하여 기여하기 &rarr;
                                    </a>
                                )}
                                <h4 className="text-sm font-bold mb-2 flex items-center gap-2 mt-4">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                                    {selectedProject.proofDescription || '활동 증명 제출'}
                                </h4>
                                <input
                                    type="text"
                                    placeholder="증빙 내용 입력 (ID, URL 등)"
                                    className="w-full p-2 border rounded-lg bg-[var(--bg-input)] text-sm"
                                    value={proofInput}
                                    onChange={(e) => setProofInput(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="secondary" onClick={() => setSelectedProject(null)}>닫기</Button>
                            <Button variant="success" onClick={handleJoin} disabled={!!isJoined || !!isFull}>
                                {isJoined ? '이미 참여함' : isFull ? '모집 완료' : <><span className="mr-1">PC</span> 증명 제출 및 보상 받기</>}
                            </Button>
                        </div>
                    </div>
                }
            >
                {selectedProject && (
                    <div>
                        <p className="text-[var(--text-muted)] text-sm mb-4">by {selectedProject.maker}</p>
                        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">{selectedProject.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-[var(--bg-card)] rounded-xl">
                                <div className="text-xs text-[var(--text-muted)] uppercase">총 발행 PC</div>
                                <div className="text-lg font-bold text-[var(--accent-gold)]">{selectedProject.totalPC.toLocaleString()} PC</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-card)] rounded-xl">
                                <div className="text-xs text-[var(--text-muted)] uppercase">1인당 PC</div>
                                <div className="text-lg font-bold text-[var(--accent-gold)]">{perPC.toLocaleString()} PC</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-card)] rounded-xl">
                                <div className="text-xs text-[var(--text-muted)] uppercase">1 PC 가치</div>
                                <div className="text-lg font-bold text-[var(--accent-cyan)]">${selectedProject.pcValue.toFixed(2)}</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-card)] rounded-xl">
                                <div className="text-xs text-[var(--text-muted)] uppercase">남은 기간</div>
                                <div className="text-lg font-bold">{Math.max(0, Math.ceil((new Date(selectedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}일</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-card)] rounded-xl">
                                <div className="text-xs text-[var(--text-muted)] uppercase">정산 조건</div>
                                <div className="text-sm font-bold">{condLabels[selectedProject.settlementCondition]}</div>
                            </div>
                            <div className="p-4 bg-[var(--bg-card)] rounded-xl">
                                <div className="text-xs text-[var(--text-muted)] uppercase">정산 세부</div>
                                <div className="text-sm text-[var(--text-secondary)]">{selectedProject.settlementDetail || '-'}</div>
                            </div>
                            {selectedProject.expectedActivity && (
                                <div className="col-span-2 p-4 bg-[var(--bg-card)] rounded-xl">
                                    <div className="text-xs text-[var(--text-muted)] uppercase">기대 활동</div>
                                    <div className="text-sm text-[var(--text-secondary)]">{selectedProject.expectedActivity}</div>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-[var(--text-secondary)]">참여 현황</span>
                                <span className="text-[var(--accent-blue)] font-semibold">{selectedProject.currentMemberCount} / {selectedProject.targetMemberCount}명</span>
                            </div>
                            <div className="h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--gradient-trust)] rounded-full"
                                    style={{ width: `${(selectedProject.currentMemberCount / selectedProject.targetMemberCount) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-600/5 mb-6">
                            <h4 className="text-[var(--accent-gold)] flex items-center gap-2 text-sm font-bold mb-3">
                                <span className="w-6 h-6 rounded-full bg-[var(--gradient-credit)] text-black flex items-center justify-center text-[10px]">PC</span>
                                PC &rarr; 스테이블코인 전환 구조
                            </h4>
                            <div className="flex items-center flex-wrap gap-2 text-sm">
                                <span className="text-[var(--accent-gold)] font-bold">{perPC.toLocaleString()} PC 획득</span>
                                <span className="text-[var(--accent-cyan)] font-bold">&rarr;</span>
                                <span className="text-[var(--accent-emerald)] font-bold">조건 충족 시</span>
                                <span className="text-[var(--accent-cyan)] font-bold">&rarr;</span>
                                <span className="text-[var(--accent-cyan)] font-bold">${perUSD} USDC 정산</span>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/15">
                            <h4 className="text-[var(--accent-blue)] text-sm font-bold mb-3">&#x1F6E1; 기여자 보호 조항 (창업자 서약 완료)</h4>
                            <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                                <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> PC 정산 이행 의무 (조건 충족 후 30일 이내)</div>
                                <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> 서비스명/법인 변경 시 정산 의무 자동 승계</div>
                                <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> 유사 사업 재창업 시 정산 의무 승계</div>
                                <div className="flex gap-2"><span className="text-emerald-500 font-bold">✓</span> TrustPledge 중재 시스템 적용</div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

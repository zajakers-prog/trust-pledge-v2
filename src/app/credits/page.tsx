"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStorage } from '@/lib/store';
import { Credit, SettlementCondition } from '@/lib/types';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const condLabels: Record<SettlementCondition, string> = {
    revenue: '첫 수익 발생 시',
    funding: '투자 유치 시',
    milestone: '마일스톤 달성 시',
    exit: 'Exit 시'
};

export default function CreditsPage() {
    const { myCredits, user } = useStorage();
    const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);

    const totalPC = myCredits.reduce((s, c) => s + c.pcAmount, 0);
    const totalValue = myCredits.reduce((s, c) => s + (c.pcAmount * c.pcValue), 0);

    const getCertId = (credit: Credit) => {
        return 'TP-' + credit.projectId.replace('proj_', '').toUpperCase() + '-' + user?.name.substring(0, 3).toUpperCase();
    };

    return (
        <div className="view active" style={{ display: 'block' }}>
            <div className="container py-8">
                <div className="mb-8">
                    <h2 className="section-title">My Pledge Credits</h2>
                    <p className="section-subtitle">보유한 PC와 정산 현황을 확인하세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="text-center py-6">
                        <div className="text-4xl font-extrabold text-[var(--accent-gold)]">{totalPC.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-2">보유 PC</div>
                    </Card>
                    <Card className="text-center py-6">
                        <div className="text-4xl font-extrabold text-[var(--accent-emerald)]">${totalValue.toFixed(2)}</div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-2">예상 정산 가치</div>
                    </Card>
                    <Card className="text-center py-6">
                        <div className="text-4xl font-extrabold text-[var(--accent-cyan)]">{myCredits.length}</div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-2">참여 프로젝트</div>
                    </Card>
                </div>

                <Card className="mb-12">
                    <div className="p-6 border-b border-[var(--border-color)]">
                        <h3 className="text-lg font-bold">보유 Pledge Credits</h3>
                    </div>

                    {myCredits.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <h3 className="text-lg text-[var(--text-secondary)] mb-2">아직 보유한 Pledge Credit이 없습니다</h3>
                            <p className="text-[var(--text-muted)] mb-6">Marketplace에서 프로젝트에 참여하고 PC를 획득하세요.</p>
                            <Link href="/contributor">
                                <Button>프로젝트 찾아보기</Button>
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {myCredits.map((c, i) => {
                                const isEquity = c.settlementCondition === 'exit' || c.settlementCondition === 'funding';
                                return (
                                    <div key={i} className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-[var(--border-color)] last:border-0 hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => setSelectedCredit(c)}
                                    >
                                        <div className="mb-2 md:mb-0 text-center md:text-left">
                                            <h4 className="font-bold text-lg mb-1">{c.projectName}</h4>
                                            <span className="text-sm text-[var(--text-muted)] block md:inline">
                                                {c.makerName} · {new Date(c.earnedAt).toLocaleDateString()} · 정산: {condLabels[c.settlementCondition]}
                                            </span>
                                        </div>
                                        <div className="text-center md:text-right">
                                            <div className="font-bold text-xl text-[var(--accent-gold)]">{c.pcAmount.toLocaleString()} PC</div>
                                            <div className="text-xs text-[var(--accent-emerald)]">
                                                {isEquity ? '지분/스톡옵션 교환권' : `≈ $${(c.pcAmount * c.pcValue).toFixed(2)}`}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>

                <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <h4 className="text-[var(--accent-gold)] font-bold text-sm mb-3 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[var(--gradient-credit)] text-black flex items-center justify-center text-xs font-bold">PC</span>
                        정산은 언제 이루어지나요?
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        각 프로젝트의 창업자가 설정한 정산 조건(첫 수익 발생, 투자 유치, 마일스톤 달성, Exit 등)이 충족되면
                        TrustPledge가 정산 프로세스를 시작합니다. 보유한 PC는 약속된 가치의 스테이블코인(USDC/USDT)으로
                        전환되어 등록된 지갑 주소로 지급됩니다.
                    </p>
                </div>
            </div>

            <Modal isOpen={!!selectedCredit} onClose={() => setSelectedCredit(null)} title="Pledge Credit 보상권 증서">
                {selectedCredit && user && (
                    <div className="relative overflow-hidden bg-slate-900 border-2 border-[var(--accent-blue)] p-8 text-center" style={{ borderImage: 'var(--gradient-trust) 1' }}>
                        <div className="text-xs text-[var(--accent-blue)] uppercase tracking-[3px] font-bold mb-2">TRUSTPLEDGE OFFICIAL CERTIFICATE</div>
                        <div className="text-2xl font-extrabold mb-2 bg-[var(--gradient-trust)] bg-clip-text text-transparent">Pledge Credit 보상권 증서</div>
                        <p className="text-xs text-[var(--text-muted)] mb-8">본 증서는 초기 기여자의 Pledge Credit 보유 및 스테이블코인 정산 청구권을 공식 증명합니다</p>

                        <div className="text-left p-6 bg-black/20 rounded-xl mb-8 space-y-3 font-mono text-sm">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-[var(--text-muted)]">증서 번호</span>
                                <span className="text-[var(--accent-cyan)] font-bold">{getCertId(selectedCredit)}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-[var(--text-muted)]">기여자</span>
                                <span>{user.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-[var(--text-muted)]">프로젝트</span>
                                <span className="font-bold">{selectedCredit.projectName}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-[var(--text-muted)]">발급 PC</span>
                                <span className="text-[var(--accent-gold)] font-bold">{selectedCredit.pcAmount.toLocaleString()} PC</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-[var(--text-muted)]">가치/정산액</span>
                                <span className="text-[var(--accent-emerald)] font-bold">${(selectedCredit.pcAmount * selectedCredit.pcValue).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pb-2">
                                <span className="text-[var(--text-muted)]">발급일</span>
                                <span>{new Date(selectedCredit.earnedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="text-[10px] text-[var(--text-muted)] text-left p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg leading-relaxed mb-6">
                            <strong>법적 고지:</strong> 본 증서에 명시된 Pledge Credit은 창업자의 전자 서명이 완료된 법적 서약에 기반합니다.
                        </div>

                        <div className="flex justify-center">
                            <Button onClick={() => alert('PDF 다운로드 기능은 준비 중입니다.')}>&#x1F4E5; 증서 다운로드</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

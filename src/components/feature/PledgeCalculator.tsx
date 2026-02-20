import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface PledgeCalculatorProps {
    totalPC: number;
    targetMembers: number;
    pcValue: number;
    deadline: string;
    rewardType?: 'cash' | 'equity';
    equityAmount?: number;
    targetValuation?: number;
}

export default function PledgeCalculator({
    totalPC, targetMembers, pcValue, deadline,
    rewardType = 'cash', equityAmount = 0, targetValuation = 0
}: PledgeCalculatorProps) {
    const perPersonPC = (totalPC && targetMembers) ? Math.floor(totalPC / targetMembers) : 0;

    // Cash Calculation
    const perPersonUSD = (perPersonPC && pcValue) ? (perPersonPC * pcValue) : 0;
    const totalUSD = (totalPC && pcValue) ? (totalPC * pcValue) : 0;

    // Equity Calculation
    // equityAmount is total equity offered (e.g. 0.005 for 0.5%)
    const perPersonEquity = (equityAmount && targetMembers) ? (equityAmount / targetMembers) : 0;
    const perPersonEquityValue = (perPersonEquity && targetValuation) ? (perPersonEquity * targetValuation) : 0;
    const totalEquityValue = (equityAmount && targetValuation) ? (equityAmount * targetValuation) : 0;

    const isEquity = rewardType === 'equity';

    return (
        <div className="calculator-panel sticky top-24">
            <Card className="calc-card mb-4" style={{
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(59,130,246,0.05) 100%)',
                border: '1px solid rgba(59,130,246,0.2)'
            }}>
                <h3 className="flex items-center gap-2 text-lg mb-6">
                    <span className="pc-icon pc-icon-lg font-bold w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-amber)] to-[var(--accent-gold)] flex items-center justify-center text-xs text-black">PC</span>
                    보상 계산기 {isEquity && <Badge label="Equity Mode" color="purple" />}
                </h3>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-[var(--text-secondary)]">총 발행 PC</span>
                    <span className="font-bold">{totalPC ? totalPC.toLocaleString() : '--'} PC</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-[var(--text-secondary)]">목표 인원</span>
                    <span className="font-bold">{targetMembers ? targetMembers.toLocaleString() : '--'}명</span>
                </div>

                <div className="h-px bg-[var(--gradient-trust)] my-3 opacity-30"></div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-[var(--text-secondary)]">1인당 PC</span>
                    <span className="font-bold text-xl text-[var(--accent-gold)]">{perPersonPC ? perPersonPC.toLocaleString() : '--'} PC</span>
                </div>

                {isEquity ? (
                    <>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-[var(--text-secondary)]">1인당 지분율</span>
                            <span className="font-bold text-[var(--accent-purple)]">
                                {perPersonEquity ? `${(perPersonEquity * 100).toFixed(5)}%` : '--%'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-[var(--text-secondary)]">1인당 예상 가치 (현 기업가치 기준)</span>
                            <span className="font-bold text-xl text-[var(--accent-emerald)]">
                                {perPersonEquityValue ? `$${perPersonEquityValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '$--'}
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-[var(--text-secondary)]">1 PC 가치</span>
                            <span className="font-bold text-[var(--accent-cyan)]">{pcValue ? `$${pcValue.toFixed(2)}` : '$--'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-sm text-[var(--text-secondary)]">1인당 예상 정산액</span>
                            <span className="font-bold text-xl text-[var(--accent-emerald)]">{perPersonUSD ? `$${perPersonUSD.toFixed(2)}` : '$--'}</span>
                        </div>
                    </>
                )}

                <div className="h-px bg-[var(--gradient-trust)] my-3 opacity-30"></div>

                <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-[var(--text-secondary)]">마감일</span>
                    <span className="font-bold">{deadline || '--'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-[var(--text-secondary)]">정산 방식</span>
                    <Badge label={isEquity ? "Stock / Options" : "USDC / USDT"} color={isEquity ? "purple" : "green"} />
                </div>
            </Card>

            <Card className="p-5">
                <h4 className="text-sm mb-3 text-[var(--accent-cyan)] flex items-center gap-2">
                    &#x1F512; 신뢰 보장 요소
                </h4>
                <div className="text-sm text-[var(--text-secondary)] space-y-2">
                    <div>&#x2713; 7개 법적 보호 조항 서약</div>
                    <div>&#x2713; 전자 서명 기반 계약</div>
                    <div>&#x2713; PC 발급 기록 영구 보존</div>
                    {isEquity ? (
                        <div className="text-[var(--accent-purple)]">&#x2713; 지분/스톡옵션 계약서 별도 제공</div>
                    ) : (
                        <div>&#x2713; 스테이블코인 기반 투명 정산</div>
                    )}
                    <div>&#x2713; 플랫폼 중재 시스템</div>
                </div>
            </Card>
        </div>
    );
}

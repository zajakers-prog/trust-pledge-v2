"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/lib/store';
import { Project, ProjectCategory } from '@/lib/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PledgeCalculator from '@/components/feature/PledgeCalculator';

export default function MakerPage() {
    const router = useRouter();
    const { addProject } = useStorage();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Project>>({
        name: '',
        maker: '',
        description: '',
        category: 'tech',
        totalPC: 0,
        pcValue: 0,
        targetMemberCount: 0,
        deadline: '',
        rewardType: 'cash',
        equityAmount: 0,
        targetValuation: 0,
        settlementCondition: 'revenue',
        settlementDetail: '',
        expectedActivity: '',
        legalProtections: { signedAt: '', signature: '' }
    });

    const [legalChecks, setLegalChecks] = useState({
        l1: false, l2: false, l3: false, l4: false, l5: false, l6: false, l7: false
    });

    // Validation
    const validateStep1 = () => {
        return formData.name && formData.maker && formData.description;
    };
    const validateStep2 = () => {
        return (formData.totalPC || 0) >= 100 &&
            (formData.targetMemberCount || 0) >= 1 &&
            (formData.pcValue || 0) >= 0.01 &&
            formData.deadline;
    };
    const validateStep3 = () => {
        return Object.values(legalChecks).every(v => v) && formData.legalProtections?.signature;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) { alert('필수 정보를 모두 입력해주세요.'); return; }
        if (step === 2 && !validateStep2()) { alert('보상 설계를 올바르게 완료해주세요.'); return; }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const updateForm = (key: string, value: any) => {
        if (key === 'legalProtections') {
            setFormData(prev => ({ ...prev, [key]: value }));
        } else {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!validateStep3()) return;

        const newProject: Project = {
            id: 'proj_' + Date.now(),
            name: formData.name!,
            maker: formData.maker!,
            description: formData.description!,
            category: formData.category as ProjectCategory,
            totalPC: formData.totalPC!,
            pcValue: formData.pcValue!,
            rewardType: formData.rewardType,
            equityAmount: formData.equityAmount,
            targetValuation: formData.targetValuation,
            targetMemberCount: formData.targetMemberCount!,
            currentMemberCount: 0,
            deadline: formData.deadline!,
            settlementCondition: formData.settlementCondition!,
            settlementDetail: formData.settlementDetail || '',
            expectedActivity: formData.expectedActivity || '',
            createdAt: new Date().toISOString(),
            status: 'active',
            legalProtections: {
                signedAt: new Date().toISOString(),
                signature: formData.legalProtections!.signature
            }
        };

        await addProject(newProject);
        alert(`프로젝트 "${newProject.name}" 등록이 완료되었습니다!`);
        router.push('/contributor');
    };

    return (
        <div className="view active" style={{ display: 'block' }}>
            <div className="container py-8">
                <div className="mb-6">
                    <h2 className="section-title">프로젝트 등록</h2>
                    <p className="section-subtitle">보상 조건을 설정하고, 기여자와의 약속을 Pledge Credit으로 공식화하세요.</p>
                </div>

                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex-1 py-3 text-center rounded-lg border text-sm font-bold transition-all
              ${step === s ? 'bg-blue-500/10 border-blue-500 text-blue-500' :
                                s < step ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)]'
                            }`}
                        >
                            {s === 1 && '1. 기본 정보'}
                            {s === 2 && '2. PC 보상 설계'}
                            {s === 3 && '3. 법적 보호 서약'}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
                    <div className="form-area">
                        {step === 1 && (
                            <Card className="animate-in">
                                <h3 className="text-xl font-bold mb-6 pb-3 border-b border-[var(--border-color)]">프로젝트 기본 정보</h3>
                                <Input label="프로젝트명 *" placeholder="예: NextGen Health Tracker"
                                    value={formData.name} onChange={e => updateForm('name', e.target.value)} />
                                <Input label="창업자/팀 이름 *" placeholder="예: 김민수 / TeamAlpha"
                                    value={formData.maker} onChange={e => updateForm('maker', e.target.value)} />
                                <div className="form-group">
                                    <label className="form-label">프로젝트 설명 *</label>
                                    <textarea placeholder="프로젝트의 비전, 현재 단계, 기여자에게 기대하는 역할을 설명하세요."
                                        value={formData.description} onChange={e => updateForm('description', e.target.value)}></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">카테고리</label>
                                    <select value={formData.category} onChange={e => updateForm('category', e.target.value)}>
                                        <option value="tech">Tech / SaaS</option>
                                        <option value="health">Health / Bio</option>
                                        <option value="finance">Finance / Fintech</option>
                                        <option value="education">Education</option>
                                        <option value="social">Social Impact</option>
                                        <option value="ecommerce">E-Commerce</option>
                                        <option value="ai">AI / ML</option>
                                        <option value="other">기타</option>
                                    </select>
                                </div>
                                <div className="flex justify-end mt-8 pt-6 border-t border-[var(--border-color)]">
                                    <Button onClick={handleNext}>다음: PC 보상 설계 &rarr;</Button>
                                </div>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="animate-in">
                                <h3 className="text-xl font-bold mb-2">Pledge Credit 보상 설계</h3>
                                <p className="text-sm text-[var(--text-secondary)] mb-6">PC는 프로젝트 성공 시 금전적 가치로 전환되는 보상 청구권입니다.</p>

                                <div className="form-group mb-6">
                                    <label className="form-label">보상 유형 선택</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${(!formData.rewardType || formData.rewardType === 'cash') ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500' : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'}`}>
                                            <input type="radio" name="rewardType" value="cash" className="hidden"
                                                checked={!formData.rewardType || formData.rewardType === 'cash'}
                                                onChange={() => updateForm('rewardType', 'cash')} />
                                            <div className="font-bold mb-1 text-lg">💰 현금 정산 (Stablecoin)</div>
                                            <div className="text-xs text-[var(--text-secondary)]">수익 발생 시 현금(USDC)으로 정산</div>
                                        </label>
                                        <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${formData.rewardType === 'equity' ? 'border-purple-500 bg-purple-500/5 ring-1 ring-purple-500' : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'}`}>
                                            <input type="radio" name="rewardType" value="equity" className="hidden"
                                                checked={formData.rewardType === 'equity'}
                                                onChange={() => updateForm('rewardType', 'equity')} />
                                            <div className="font-bold mb-1 text-lg text-[var(--accent-purple)]">📈 지분 보상 (Equity)</div>
                                            <div className="text-xs text-[var(--text-secondary)]">미래 지분/스톡옵션 교환권 제공</div>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <Input label="총 발행 PC 수량 *" type="number" placeholder="예: 10000"
                                        value={formData.totalPC || ''} onChange={e => updateForm('totalPC', parseFloat(e.target.value))} />
                                    <Input label="목표 기여자 수 *" type="number" placeholder="예: 100"
                                        value={formData.targetMemberCount || ''} onChange={e => updateForm('targetMemberCount', parseInt(e.target.value))} />
                                </div>

                                {formData.rewardType === 'equity' ? (
                                    <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20 mb-6">
                                        <h4 className="text-sm font-bold text-[var(--accent-purple)] mb-4">지분 설계 (Equity Design)</h4>
                                        <div className="form-row">
                                            <Input label="제공할 총 지분율 (0~1) *" type="number" step="0.001" placeholder="예: 0.01 (1%)"
                                                value={formData.equityAmount || ''} onChange={e => updateForm('equityAmount', parseFloat(e.target.value))} />
                                            <Input label="현재/목표 기업가치 (USD) *" type="number" placeholder="예: 10000000 ($10M)"
                                                value={formData.targetValuation || ''} onChange={e => updateForm('targetValuation', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="text-xs text-[var(--text-secondary)] mt-2">
                                            * 총 지분율 0.01은 1%를 의미합니다. 이 지분은 발행된 총 PC 보유자들에게 비례 배분됩니다.
                                        </div>
                                    </div>
                                ) : (
                                    <div className="form-row">
                                        <Input label="1 PC 예상 가치 (USD) *" type="number" step="0.01" placeholder="예: 0.10"
                                            value={formData.pcValue || ''} onChange={e => updateForm('pcValue', parseFloat(e.target.value))} />
                                        <Input label="모집 마감일 *" type="date"
                                            value={formData.deadline} onChange={e => updateForm('deadline', e.target.value)} />
                                    </div>
                                )}

                                {formData.rewardType === 'equity' && (
                                    <div className="form-group">
                                        <Input label="모집 마감일 *" type="date"
                                            value={formData.deadline} onChange={e => updateForm('deadline', e.target.value)} />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">정산 조건 (Trigger) *</label>
                                    <select value={formData.settlementCondition} onChange={e => updateForm('settlementCondition', e.target.value)}>
                                        {formData.rewardType === 'equity' ? (
                                            <>
                                                <option value="exit">Exit (인수/합병/IPO) 시</option>
                                                <option value="funding">후속 투자 유치 (Series A+) 시</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="revenue">첫 수익 발생 시</option>
                                                <option value="funding">투자 유치 시</option>
                                                <option value="milestone">마일스톤 달성 시</option>
                                                <option value="exit">Exit(인수/합병/IPO) 시</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">정산 세부 조건 (선택)</label>
                                    <textarea placeholder="예: 상세 조건 입력"
                                        value={formData.settlementDetail} onChange={e => updateForm('settlementDetail', e.target.value)}></textarea>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">기여 활동</label>
                                    <textarea placeholder="예: 베타 테스트 참여, 마케팅 활동 등"
                                        value={formData.expectedActivity} onChange={e => updateForm('expectedActivity', e.target.value)}></textarea>
                                </div>

                                <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
                                    <Button variant="secondary" onClick={handleBack}>&larr; 이전</Button>
                                    <Button onClick={handleNext}>다음: 법적 보호 서약 &rarr;</Button>
                                </div>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="animate-in">
                                <h3 className="text-xl font-bold mb-4">법적 보호 서약 (Legal Safeguard)</h3>
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 mb-6">
                                    <h4 className="text-[var(--accent-amber)] font-bold mb-4 flex items-center gap-2">
                                        &#x26A0; 필수 동의 조항
                                    </h4>
                                    {[
                                        "보상 이행 의무: 정산 조건 충족 시 30일 이내 정산 이행",
                                        "서비스명 변경 시 승계: 브랜드 변경 시에도 정산 의무 승계",
                                        "법인 전환 시 승계: 법인 전환/합병 시에도 의무 승계",
                                        "유사 사업 재창업 방지: 중단 후 유사 사업 시 의무 승계",
                                        "제3자 양도 시 통지 의무: 매각 시 양수인에게 의무 승계",
                                        "플랫폼 중재권: 분쟁 시 TrustPledge 중재 수용",
                                        "기록 불변성: PC 발급 기록의 영구 보존 및 증거 효력 인정"
                                    ].map((text, i) => (
                                        <div key={i} className="flex gap-3 py-3 border-b border-amber-500/10 last:border-0">
                                            <input type="checkbox" id={`l${i + 1}`} className="mt-1 accent-[var(--accent-amber)] w-5 h-5 shrink-0"
                                                onChange={e => setLegalChecks(prev => ({ ...prev, [`l${i + 1}`]: e.target.checked }))} />
                                            <label htmlFor={`l${i + 1}`} className="text-sm text-[var(--text-secondary)] cursor-pointer">
                                                <strong className="text-white block mb-1">[제{i + 1}조]</strong> {text}
                                            </label>
                                        </div>
                                    ))}
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                                        &#x26A0; 위 7개 조항 전체에 동의하고 전자서명을 완료해야 합니다.
                                    </div>
                                </div>

                                <Input label="전자 서명 (Full Name) *" placeholder="법적 성명을 정확히 입력하세요"
                                    value={formData.legalProtections?.signature}
                                    onChange={e => updateForm('legalProtections', { ...formData.legalProtections, signature: e.target.value })} />

                                <div className="flex justify-between mt-8 pt-6 border-t border-[var(--border-color)]">
                                    <Button variant="secondary" onClick={handleBack}>&larr; 이전</Button>
                                    <Button variant="success" size="large" onClick={handleSubmit} disabled={!validateStep3()}>
                                        프로젝트 등록 완료
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="hidden md:block">
                        <PledgeCalculator
                            totalPC={formData.totalPC || 0}
                            targetMembers={formData.targetMemberCount || 0}
                            pcValue={formData.pcValue || 0}
                            deadline={formData.deadline || ''}
                            rewardType={formData.rewardType}
                            equityAmount={formData.equityAmount}
                            targetValuation={formData.targetValuation}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

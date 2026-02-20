"use client";

import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Project, SettlementCondition } from '@/lib/types';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

const condLabels: Record<SettlementCondition, string> = {
    revenue: '첫 수익 발생 시',
    funding: '투자 유치 시',
    milestone: '마일스톤 달성 시',
    exit: 'Exit 시'
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
    const progress = Math.round((project.currentMemberCount / project.targetMemberCount) * 100);
    const days = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const perPC = Math.floor(project.totalPC / project.targetMemberCount);
    const perUSD = (perPC * project.pcValue).toFixed(2);

    return (
        <div className="card project-card cursor-pointer relative overflow-hidden group hover:shadow-[var(--shadow-glow)] hover:border-blue-500/50 transition-all" onClick={onClick}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--gradient-trust)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold mb-1">{project.name}</h3>
                    <div className="text-xs text-[var(--text-muted)]">{project.maker}</div>
                </div>
                <Badge label="PC" color="gold" />
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-5 line-clamp-2 h-[40px]">
                {project.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[var(--bg-input)] p-2 rounded-lg">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">1인당 PC</div>
                    <div className="text-[var(--accent-gold)] font-bold text-sm">{perPC.toLocaleString()} PC</div>
                </div>
                <div className="bg-[var(--bg-input)] p-2 rounded-lg">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                        {project.rewardType === 'equity' ? '1인당 지분' : '예상 정산'}
                    </div>
                    <div className="text-[var(--accent-emerald)] font-bold text-sm">
                        {project.rewardType === 'equity'
                            ? (project.equityAmount && project.targetMemberCount
                                ? `${((project.equityAmount / project.targetMemberCount) * 100).toFixed(4)}%`
                                : '--%')
                            : `$${perUSD}`
                        }
                    </div>
                </div>
                <div className="bg-[var(--bg-input)] p-2 rounded-lg">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">남은 기간</div>
                    <div style={{ color: days < 7 ? 'var(--accent-red)' : 'var(--text-primary)' }} className="font-bold text-sm">{days}일</div>
                </div>
                <div className="bg-[var(--bg-input)] p-2 rounded-lg">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">정산 조건</div>
                    <div className="text-xs font-medium truncate">{condLabels[project.settlementCondition]}</div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-[var(--text-secondary)]">참여 현황</span>
                    <span className="text-[var(--accent-blue)] font-semibold">{project.currentMemberCount} / {project.targetMemberCount}명 ({progress}%)</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--gradient-trust)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
}

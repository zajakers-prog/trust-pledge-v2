"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Project, User, Credit, ProjectCategory } from './types';

interface StorageContextType {
    user: User | null;
    projects: Project[];
    myCredits: Credit[];
    login: (provider: 'google' | 'apple' | 'guest', name?: string) => void;
    logout: () => void;
    addProject: (project: Project) => void;
    joinProject: (projectId: string, proof?: string) => void;
    isLoading: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Initial Dummy Data
const INITIAL_PROJECTS: Project[] = [
    {
        id: 'proj_001', name: 'MindFlow - AI 명상 앱',
        maker: '이승현 / MindFlow Labs',
        description: '개인 맞춤형 AI 명상 가이드 앱. 심박수·스트레스 지수를 실시간 분석하여 최적의 명상 세션을 자동 생성합니다.',
        category: 'health',
        totalPC: 10000, pcValue: 0.50, targetMemberCount: 100, currentMemberCount: 67,
        deadline: '2026-04-15',
        settlementCondition: 'revenue', settlementDetail: '월 매출 $5,000 달성 시',
        expectedActivity: '앱 베타 테스트 및 UX 피드백 제출',
        contributionLink: 'https://mindflow.app/beta',
        proofDescription: '가입한 이메일 주소를 입력해주세요.',
        legalProtections: { signedAt: '2026-01-10T09:00:00Z', signature: '이승현' },
        createdAt: '2026-01-10T09:00:00Z', status: 'active'
    },
    {
        id: 'proj_002', name: 'FarmDirect - 산지직송 플랫폼',
        maker: '박지영 / AgriBridge',
        description: '농가와 소비자를 직접 연결하는 산지직송 커머스. 중간 유통 마진을 없애 농가 수익을 높이고 소비자에게 합리적 가격을 제공합니다.',
        category: 'ecommerce',
        totalPC: 5000, pcValue: 1.00, targetMemberCount: 50, currentMemberCount: 31,
        deadline: '2026-03-30',
        settlementCondition: 'funding', settlementDetail: '시드 투자 유치 시',
        expectedActivity: '플랫폼 회원가입 및 첫 구매 후 리뷰 작성',
        contributionLink: 'https://farmdirect.co.kr/signup',
        proofDescription: '가입 아이디와 첫 구매 주문번호를 입력해주세요.',
        legalProtections: { signedAt: '2026-01-22T14:30:00Z', signature: '박지영' },
        createdAt: '2026-01-22T14:30:00Z', status: 'active'
    },
    {
        id: 'proj_003', name: 'CodeMentor AI - 코딩 교육 봇',
        maker: '정태윤 / EduTech Co.',
        description: 'GPT 기반 1:1 맞춤 코딩 튜터. 학습자의 수준을 실시간 파악하고 개인화된 커리큘럼과 코드 리뷰를 제공합니다.',
        category: 'ai',
        totalPC: 20000, pcValue: 0.25, targetMemberCount: 200, currentMemberCount: 142,
        deadline: '2026-05-01',
        settlementCondition: 'milestone', settlementDetail: '유료 회원 1,000명 달성 시',
        expectedActivity: '2주간 봇 학습 세션 참여 및 피드백 보고서 제출',
        contributionLink: 'https://codementor.ai/study',
        proofDescription: '학습 세션 완료 스크린샷 링크를 제출해주세요.',
        legalProtections: { signedAt: '2026-02-01T11:15:00Z', signature: '정태윤' },
        createdAt: '2026-02-01T11:15:00Z', status: 'active'
    },
    {
        id: 'proj_004', name: 'NeuroLink - BCI 스타트업',
        maker: '최현석 / NeuroLink Inc.',
        description: '뇌-컴퓨터 인터페이스(BCI) 제어 소프트웨어. 생각만으로 기기를 제어하는 혁신적인 기술을 개발합니다. 초기 기여자에게 미래 지분을 약속합니다.',
        category: 'tech',
        totalPC: 50000, pcValue: 1.0,
        rewardType: 'equity', equityAmount: 0.005, targetValuation: 20000000, // 0.5% equity at $20M val
        targetMemberCount: 10, currentMemberCount: 4,
        deadline: '2026-12-31',
        settlementCondition: 'exit', settlementDetail: 'IPO 또는 M&A 시 지분 가치 실현',
        expectedActivity: 'BCI 데이터 수집 실험 참여 (판교 오피스 방문)',
        contributionLink: 'https://neurolink.tech/join',
        proofDescription: '실험 참여 확인증 사진을 업로드해주세요.',
        legalProtections: { signedAt: '2026-02-10T10:00:00Z', signature: '최현석' },
        createdAt: '2026-02-10T10:00:00Z', status: 'active'
    }
];

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [myCredits, setMyCredits] = useState<Credit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sync with NextAuth session
    useEffect(() => {
        if (session?.user) {
            setUser({
                name: session.user.name || 'User',
                email: session.user.email || '',
                avatar: session.user.image || (session.user.name || 'U')[0],
                provider: 'google' // Simplified mapping
            });
        }
    }, [session]);

    // Load from localStorage on mount
    useEffect(() => {
        const loadedProjects = localStorage.getItem('tp_projects');
        const loadedCredits = localStorage.getItem('tp_credits');
        const loadedUser = localStorage.getItem('tp_user');

        if (loadedProjects) {
            setProjects(JSON.parse(loadedProjects));
        } else {
            setProjects(INITIAL_PROJECTS);
            localStorage.setItem('tp_projects', JSON.stringify(INITIAL_PROJECTS));
        }

        if (loadedCredits) setMyCredits(JSON.parse(loadedCredits));

        // Only load manual user if no session
        if (!session && loadedUser) setUser(JSON.parse(loadedUser));

        setIsLoading(false);
    }, []);

    // Sync to localStorage
    useEffect(() => {
        if (!isLoading) localStorage.setItem('tp_projects', JSON.stringify(projects));
    }, [projects, isLoading]);

    useEffect(() => {
        if (!isLoading) localStorage.setItem('tp_credits', JSON.stringify(myCredits));
    }, [myCredits, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            if (user) localStorage.setItem('tp_user', JSON.stringify(user));
            else localStorage.removeItem('tp_user');
        }
    }, [user, isLoading]);

    const login = (provider: 'google' | 'apple' | 'guest', name?: string) => {
        let newUser: User;
        if (provider === 'guest') {
            newUser = {
                name: name || 'Guest',
                provider: 'guest',
                avatar: (name || 'G')[0].toUpperCase(),
                email: ''
            };
            setUser(newUser);
        } else {
            // Managed by NextAuth trigger in Login page, but here for type safety
            // When using real auth, this function might just receive user data or do nothing
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('tp_user');
        signOut({ callbackUrl: '/login' });
    };

    const addProject = (project: Project) => {
        setProjects(prev => [...prev, project]);
    };

    const joinProject = (projectId: string, proof?: string) => {
        console.log('Attempting to join project:', projectId);
        if (!user) {
            console.log('Join failed: No user logged in');
            return;
        }
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            console.log('Join failed: Project not found');
            return;
        }

        // Check if already joined
        if (myCredits.some(c => c.projectId === projectId)) {
            console.log('Join failed: Already joined');
            return;
        }

        const project = projects[projectIndex];
        const perPC = Math.floor(project.totalPC / project.targetMemberCount);

        console.log('Joining project:', project.name, 'PC:', perPC);

        // Update project
        const updatedProjects = [...projects];
        updatedProjects[projectIndex] = {
            ...project,
            currentMemberCount: project.currentMemberCount + 1
        };
        setProjects(updatedProjects);

        // Add Credit
        const newCredit: Credit = {
            projectId: project.id,
            projectName: project.name,
            makerName: project.maker,
            pcAmount: perPC,
            pcValue: project.pcValue,
            earnedAt: new Date().toISOString(),
            proof: proof,
            settlementCondition: project.settlementCondition,
            settlementDetail: project.settlementDetail
        };
        setMyCredits(prev => [...prev, newCredit]);
    };

    return (
        <StorageContext.Provider value={{
            user, projects, myCredits, login, logout, addProject, joinProject, isLoading
        }}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
}

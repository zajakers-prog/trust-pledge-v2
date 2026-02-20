"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Project, User, Credit } from './types';

interface StorageContextType {
    user: User | null;
    projects: Project[];
    myCredits: Credit[];
    login: (provider: 'google' | 'apple' | 'guest', name?: string) => void;
    logout: () => void;
    addProject: (project: Project) => Promise<void>;
    joinProject: (projectId: string, proof?: string) => Promise<void>;
    isLoading: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [myCredits, setMyCredits] = useState<Credit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // NextAuth 세션 동기화
    useEffect(() => {
        if (session?.user) {
            setUser({
                name: session.user.name || 'User',
                email: session.user.email || '',
                avatar: session.user.image || (session.user.name || 'U')[0],
                provider: 'google',
            });
        }
    }, [session]);

    // 프로젝트 목록 API에서 로드
    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then((data: Project[]) => {
                if (Array.isArray(data)) setProjects(data);
            })
            .catch(() => {
                // API 실패 시 localStorage 폴백
                const local = localStorage.getItem('tp_projects');
                if (local) setProjects(JSON.parse(local));
            })
            .finally(() => setIsLoading(false));
    }, []);

    // 내 크레딧 로드 (로그인 후)
    useEffect(() => {
        if (!user?.email) {
            // 게스트: localStorage 사용
            const local = localStorage.getItem('tp_credits');
            if (local) setMyCredits(JSON.parse(local));
            return;
        }
        fetch(`/api/credits?email=${encodeURIComponent(user.email)}`)
            .then(res => res.json())
            .then((data: Credit[]) => {
                if (Array.isArray(data)) setMyCredits(data);
            })
            .catch(() => {
                const local = localStorage.getItem('tp_credits');
                if (local) setMyCredits(JSON.parse(local));
            });
    }, [user?.email]);

    const login = (provider: 'google' | 'apple' | 'guest', name?: string) => {
        if (provider === 'guest') {
            const newUser: User = {
                name: name || 'Guest',
                provider: 'guest',
                avatar: (name || 'G')[0].toUpperCase(),
                email: '',
            };
            setUser(newUser);
            localStorage.setItem('tp_user', JSON.stringify(newUser));
        }
    };

    const logout = () => {
        setUser(null);
        setMyCredits([]);
        localStorage.removeItem('tp_user');
        localStorage.removeItem('tp_credits');
        signOut({ callbackUrl: '/login' });
    };

    const addProject = async (project: Project) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project),
        });
        if (res.ok) {
            setProjects(prev => [project, ...prev]);
        }
    };

    const joinProject = async (projectId: string, proof?: string) => {
        if (!user) return;

        const res = await fetch(`/api/projects/${projectId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userEmail: user.email,
                userName: user.name,
                proof,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || '참여 실패');
        }

        const { pcAmount, pcValue } = await res.json();
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        // 로컬 상태 업데이트
        setProjects(prev =>
            prev.map(p =>
                p.id === projectId
                    ? { ...p, currentMemberCount: p.currentMemberCount + 1 }
                    : p
            )
        );

        const newCredit: Credit = {
            projectId: project.id,
            projectName: project.name,
            makerName: project.maker,
            pcAmount,
            pcValue,
            earnedAt: new Date().toISOString(),
            proof,
            settlementCondition: project.settlementCondition,
            settlementDetail: project.settlementDetail,
        };
        setMyCredits(prev => [newCredit, ...prev]);

        // 게스트는 localStorage에도 저장
        if (user.provider === 'guest') {
            const updated = [newCredit, ...myCredits];
            localStorage.setItem('tp_credits', JSON.stringify(updated));
        }
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

export type ProjectCategory =
    | 'tech' | 'health' | 'finance' | 'education'
    | 'social' | 'ecommerce' | 'ai' | 'other';

export type SettlementCondition =
    | 'revenue' | 'funding' | 'milestone' | 'exit';

export interface LegalProtection {
    signedAt: string;
    signature: string;
}

export interface Project {
    id: string;
    name: string;
    maker: string;
    description: string;
    category: ProjectCategory;
    totalPC: number;
    pcValue: number;
    targetMemberCount: number;
    currentMemberCount: number;
    deadline: string;
    settlementCondition: SettlementCondition;
    settlementDetail: string;
    expectedActivity: string;
    contributionLink?: string;
    proofDescription?: string;
    legalProtections: LegalProtection;
    createdAt: string;
    status: 'active' | 'completed' | 'cancelled';
}

export interface User {
    name: string;
    provider: 'google' | 'apple' | 'guest';
    avatar: string; // 'G', 'A', or initial
    email: string;
}

export interface Credit {
    projectId: string;
    projectName: string;
    makerName: string;
    pcAmount: number;
    pcValue: number;
    earnedAt: string;
    proof?: string;
    settlementCondition: SettlementCondition;
    settlementDetail: string;
}

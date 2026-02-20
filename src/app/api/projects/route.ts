import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Project } from '@/lib/types';

// GET /api/projects - 전체 프로젝트 목록 (makerEmail 파라미터로 창업자 프로젝트 필터링 가능)
export async function GET(req: NextRequest) {
    const supabase = createServerClient();
    const makerEmail = req.nextUrl.searchParams.get('makerEmail');

    let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (makerEmail) {
        query = query.eq('maker_email', makerEmail);
    } else {
        query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // DB snake_case → 앱 camelCase 변환
    const projects: Project[] = (data || []).map(dbToProject);
    return NextResponse.json(projects);
}

// POST /api/projects - 새 프로젝트 등록
export async function POST(req: NextRequest) {
    const supabase = createServerClient();
    const body: Project = await req.json();

    const { error } = await supabase.from('projects').insert({
        id: body.id,
        name: body.name,
        maker: body.maker,
        maker_email: body.makerEmail || '',
        description: body.description,
        category: body.category,
        total_pc: body.totalPC,
        pc_value: body.pcValue,
        reward_type: body.rewardType || 'cash',
        equity_amount: body.equityAmount || null,
        target_valuation: body.targetValuation || null,
        target_member_count: body.targetMemberCount,
        current_member_count: body.currentMemberCount,
        deadline: body.deadline,
        settlement_condition: body.settlementCondition,
        settlement_detail: body.settlementDetail,
        expected_activity: body.expectedActivity,
        contribution_link: body.contributionLink || null,
        proof_description: body.proofDescription || null,
        legal_signed_at: body.legalProtections?.signedAt || null,
        legal_signature: body.legalProtections?.signature || null,
        status: body.status || 'active',
        created_at: body.createdAt,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}

// DB row → Project 타입 변환
function dbToProject(row: any): Project {
    return {
        id: row.id,
        name: row.name,
        maker: row.maker,
        makerEmail: row.maker_email || undefined,
        description: row.description,
        category: row.category,
        totalPC: row.total_pc,
        pcValue: parseFloat(row.pc_value),
        rewardType: row.reward_type,
        equityAmount: row.equity_amount ? parseFloat(row.equity_amount) : undefined,
        targetValuation: row.target_valuation || undefined,
        targetMemberCount: row.target_member_count,
        currentMemberCount: row.current_member_count,
        deadline: row.deadline,
        settlementCondition: row.settlement_condition,
        settlementDetail: row.settlement_detail,
        expectedActivity: row.expected_activity,
        contributionLink: row.contribution_link || undefined,
        proofDescription: row.proof_description || undefined,
        legalProtections: {
            signedAt: row.legal_signed_at || '',
            signature: row.legal_signature || '',
        },
        createdAt: row.created_at,
        status: row.status,
    };
}

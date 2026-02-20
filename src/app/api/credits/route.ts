import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Credit } from '@/lib/types';

// GET /api/credits?email=user@example.com - 내 크레딧 목록
export async function GET(req: NextRequest) {
    const supabase = createServerClient();
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: '이메일이 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('user_email', email)
        .order('earned_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const credits: Credit[] = (data || []).map((row: any) => ({
        projectId: row.project_id,
        projectName: row.project_name,
        makerName: row.maker_name,
        pcAmount: row.pc_amount,
        pcValue: parseFloat(row.pc_value),
        earnedAt: row.earned_at,
        proof: row.proof || undefined,
        settlementCondition: row.settlement_condition,
        settlementDetail: row.settlement_detail,
    }));

    return NextResponse.json(credits);
}

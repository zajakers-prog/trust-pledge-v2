import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/contributions?makerEmail=... - 창업자의 프로젝트 기여 신청 목록
export async function GET(req: NextRequest) {
    const supabase = createServerClient();
    const makerEmail = req.nextUrl.searchParams.get('makerEmail');
    const status = req.nextUrl.searchParams.get('status'); // pending | approved | rejected | all

    if (!makerEmail) {
        return NextResponse.json({ error: '창업자 이메일이 필요합니다.' }, { status: 400 });
    }

    // 창업자의 프로젝트 목록 조회
    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id')
        .eq('maker_email', makerEmail);

    if (projError) {
        return NextResponse.json({ error: projError.message }, { status: 500 });
    }

    const projectIds = (projects || []).map((p: { id: string }) => p.id);
    if (projectIds.length === 0) {
        return NextResponse.json([]);
    }

    let query = supabase
        .from('credits')
        .select('*')
        .in('project_id', projectIds)
        .order('earned_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

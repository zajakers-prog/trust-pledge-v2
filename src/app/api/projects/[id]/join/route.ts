import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/projects/[id]/join - 프로젝트 참여 (PC 획득)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createServerClient();
    const { userEmail, userName, proof } = await req.json();

    if (!userEmail || !userName) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 프로젝트 조회
    const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !project) {
        return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    const perPC = Math.floor(project.total_pc / project.target_member_count);

    // Credit 삽입 (unique constraint로 중복 방지)
    const { error: insertError } = await supabase.from('credits').insert({
        project_id: project.id,
        project_name: project.name,
        maker_name: project.maker,
        user_email: userEmail,
        user_name: userName,
        pc_amount: perPC,
        pc_value: project.pc_value,
        proof: proof || null,
        settlement_condition: project.settlement_condition,
        settlement_detail: project.settlement_detail,
        status: 'pending',
    });

    if (insertError) {
        if (insertError.code === '23505') {
            return NextResponse.json({ error: '이미 참여한 프로젝트입니다.' }, { status: 409 });
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 참여자 수 증가
    await supabase
        .from('projects')
        .update({ current_member_count: project.current_member_count + 1 })
        .eq('id', id);

    return NextResponse.json({
        success: true,
        pcAmount: perPC,
        pcValue: parseFloat(project.pc_value),
    });
}

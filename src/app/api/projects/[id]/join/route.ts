import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendNewContributionEmail } from '@/lib/email';

// POST /api/projects/[id]/join - 프로젝트 기여 신청
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

    // Credit 삽입 (status: pending → 창업자 승인 대기)
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

    // 창업자에게 이메일 알림 발송
    if (project.maker_email) {
        try {
            await sendNewContributionEmail({
                toEmail: project.maker_email,
                toName: project.maker,
                contributorName: userName,
                projectName: project.name,
                projectId: project.id,
                proof,
            });
        } catch (emailError) {
            console.error('창업자 알림 이메일 발송 실패:', emailError);
        }
    }

    return NextResponse.json({
        success: true,
        message: '기여 신청이 완료되었습니다. 창업자 승인 후 PC가 지급됩니다.',
        pcAmount: perPC,
        pcValue: parseFloat(project.pc_value),
    });
}

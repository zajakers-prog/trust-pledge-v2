import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendContributionApprovedEmail, sendContributionRejectedEmail } from '@/lib/email';

// PATCH /api/contributions/[id] - 기여 신청 승인 또는 거절
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createServerClient();
    const { action, rejectReason } = await req.json(); // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'action은 approve 또는 reject이어야 합니다.' }, { status: 400 });
    }

    if (action === 'reject' && !rejectReason) {
        return NextResponse.json({ error: '거절 사유를 입력해주세요.' }, { status: 400 });
    }

    // 기존 기여 신청 조회
    const { data: credit, error: fetchError } = await supabase
        .from('credits')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !credit) {
        return NextResponse.json({ error: '기여 신청을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (credit.status !== 'pending') {
        return NextResponse.json({ error: '이미 처리된 신청입니다.' }, { status: 409 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const updatePayload: Record<string, string> = { status: newStatus };
    if (action === 'reject') {
        updatePayload.reject_reason = rejectReason;
    }

    const { error: updateError } = await supabase
        .from('credits')
        .update(updatePayload)
        .eq('id', id);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 이메일 알림 발송 (실패해도 응답은 성공)
    try {
        if (action === 'approve') {
            await sendContributionApprovedEmail({
                toEmail: credit.user_email,
                toName: credit.user_name,
                projectName: credit.project_name,
                pcAmount: credit.pc_amount,
                pcValue: parseFloat(credit.pc_value),
                settlementCondition: credit.settlement_condition,
            });
        } else {
            await sendContributionRejectedEmail({
                toEmail: credit.user_email,
                toName: credit.user_name,
                projectName: credit.project_name,
                rejectReason,
            });
        }
    } catch (emailError) {
        console.error('이메일 발송 실패:', emailError);
    }

    return NextResponse.json({ success: true, status: newStatus });
}

import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@trustpledge.io';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trust-pledge-v2.vercel.app';

// 창업자에게: 새 기여 신청 도착
export async function sendNewContributionEmail({
    toEmail,
    toName,
    contributorName,
    projectName,
    projectId,
    proof,
}: {
    toEmail: string;
    toName: string;
    contributorName: string;
    projectName: string;
    projectId: string;
    proof?: string;
}) {
    if (!process.env.SENDGRID_API_KEY) return;

    const dashboardUrl = `${SITE_URL}/dashboard`;

    await sgMail.send({
        to: toEmail,
        from: FROM_EMAIL,
        subject: `[TrustPledge] "${projectName}"에 새 기여 신청이 도착했습니다`,
        html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #2563eb;">새 기여 신청 도착 🎉</h2>
  <p>안녕하세요, <strong>${toName}</strong>님!</p>
  <p><strong>${contributorName}</strong>님이 <strong>"${projectName}"</strong> 프로젝트에 기여 신청을 했습니다.</p>
  ${proof ? `<p><strong>기여 증빙:</strong> ${proof}</p>` : ''}
  <br/>
  <a href="${dashboardUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
    대시보드에서 확인하기 →
  </a>
  <br/><br/>
  <p style="color: #6b7280; font-size: 13px;">48시간 내에 승인 또는 거절해주세요.</p>
</div>
        `,
    });
}

// 기여자에게: PC 지급 완료 (승인)
export async function sendContributionApprovedEmail({
    toEmail,
    toName,
    projectName,
    pcAmount,
    pcValue,
    settlementCondition,
}: {
    toEmail: string;
    toName: string;
    projectName: string;
    pcAmount: number;
    pcValue: number;
    settlementCondition: string;
}) {
    if (!process.env.SENDGRID_API_KEY) return;

    const conditionLabel: Record<string, string> = {
        revenue: '매출 목표 달성',
        funding: '투자 유치',
        milestone: '마일스톤 달성',
        exit: 'IPO / M&A',
    };

    await sgMail.send({
        to: toEmail,
        from: FROM_EMAIL,
        subject: `[TrustPledge] "${projectName}" PC ${pcAmount.toLocaleString()}개 지급 완료!`,
        html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #16a34a;">PC 지급 완료 ✅</h2>
  <p>안녕하세요, <strong>${toName}</strong>님!</p>
  <p><strong>"${projectName}"</strong> 창업자가 기여를 승인했습니다.</p>
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0;"><strong>지급된 PC:</strong> ${pcAmount.toLocaleString()} PC</p>
    <p style="margin: 8px 0 0;"><strong>1 PC 가치:</strong> ${pcValue.toLocaleString()}원</p>
    <p style="margin: 8px 0 0;"><strong>정산 조건:</strong> ${conditionLabel[settlementCondition] || settlementCondition}</p>
  </div>
  <a href="${SITE_URL}/contributor" style="background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
    내 PC 현황 보기 →
  </a>
</div>
        `,
    });
}

// 기여자에게: 기여 거절
export async function sendContributionRejectedEmail({
    toEmail,
    toName,
    projectName,
    rejectReason,
}: {
    toEmail: string;
    toName: string;
    projectName: string;
    rejectReason: string;
}) {
    if (!process.env.SENDGRID_API_KEY) return;

    await sgMail.send({
        to: toEmail,
        from: FROM_EMAIL,
        subject: `[TrustPledge] "${projectName}" 기여 신청 결과 안내`,
        html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #dc2626;">기여 신청 거절 안내</h2>
  <p>안녕하세요, <strong>${toName}</strong>님.</p>
  <p><strong>"${projectName}"</strong>에 대한 기여 신청이 아쉽게도 거절되었습니다.</p>
  <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0;"><strong>거절 사유:</strong> ${rejectReason}</p>
  </div>
  <p>다른 프로젝트에서 다시 도전해보세요!</p>
  <a href="${SITE_URL}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
    다른 프로젝트 보기 →
  </a>
</div>
        `,
    });
}

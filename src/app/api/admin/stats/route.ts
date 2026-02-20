import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/admin/stats - 관리자용 전체 통계
// 환경변수 ADMIN_SECRET으로 간단한 인증
export async function GET(req: NextRequest) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    const supabase = createServerClient();

    const [{ data: projects }, { data: contributions }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('credits').select('*').order('earned_at', { ascending: false }),
    ]);

    const stats = {
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'active').length || 0,
        totalContributions: contributions?.length || 0,
        pendingContributions: contributions?.filter(c => c.status === 'pending').length || 0,
        approvedContributions: contributions?.filter(c => c.status === 'approved').length || 0,
        rejectedContributions: contributions?.filter(c => c.status === 'rejected').length || 0,
    };

    return NextResponse.json({ stats, projects: projects || [], contributions: contributions || [] });
}

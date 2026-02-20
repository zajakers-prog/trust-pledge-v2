-- TrustPledge v2 Database Schema
-- Supabase에서 SQL 에디터로 이 파일을 실행하세요.

-- 1. Projects 테이블
create table if not exists projects (
    id text primary key,
    name text not null,
    maker text not null,
    maker_email text,
    description text not null,
    category text not null check (category in ('tech','health','finance','education','social','ecommerce','ai','other')),
    total_pc integer not null,
    pc_value numeric(10,4) not null,
    reward_type text check (reward_type in ('cash','equity')),
    equity_amount numeric(10,6),
    target_valuation bigint,
    target_member_count integer not null,
    current_member_count integer not null default 0,
    deadline date not null,
    settlement_condition text not null check (settlement_condition in ('revenue','funding','milestone','exit')),
    settlement_detail text not null,
    expected_activity text not null,
    contribution_link text,
    proof_description text,
    legal_signed_at timestamptz,
    legal_signature text,
    status text not null default 'active' check (status in ('active','completed','cancelled')),
    created_at timestamptz not null default now()
);

-- 2. Credits 테이블 (기여자가 획득한 PC 기록)
create table if not exists credits (
    id uuid primary key default gen_random_uuid(),
    project_id text not null references projects(id),
    project_name text not null,
    maker_name text not null,
    user_email text not null,
    user_name text not null,
    pc_amount integer not null,
    pc_value numeric(10,4) not null,
    proof text,
    settlement_condition text not null,
    settlement_detail text not null,
    status text not null default 'pending' check (status in ('pending','approved','rejected','settled')),
    earned_at timestamptz not null default now()
);

-- 3. 중복 참여 방지 (유저 1명 = 프로젝트 1회만 참여)
create unique index if not exists credits_unique_user_project
    on credits(project_id, user_email);

-- 4. RLS (Row Level Security) 설정
alter table projects enable row level security;
alter table credits enable row level security;

-- 프로젝트: 누구나 읽기 가능, 인증된 유저만 쓰기
create policy "projects_read_all" on projects for select using (true);
create policy "projects_insert_auth" on projects for insert with check (true);
create policy "projects_update_member_count" on projects for update using (true);

-- credits: 본인 것만 읽기, 인증된 유저만 쓰기
create policy "credits_read_own" on credits for select using (true);
create policy "credits_insert_auth" on credits for insert with check (true);

-- 5. 더미 데이터 초기 삽입
insert into projects (id, name, maker, description, category, total_pc, pc_value, target_member_count, current_member_count, deadline, settlement_condition, settlement_detail, expected_activity, contribution_link, proof_description, legal_signed_at, legal_signature, created_at, status)
values
(
    'proj_001', 'MindFlow - AI 명상 앱', '이승현 / MindFlow Labs',
    '개인 맞춤형 AI 명상 가이드 앱. 심박수·스트레스 지수를 실시간 분석하여 최적의 명상 세션을 자동 생성합니다.',
    'health', 10000, 0.50, 100, 67, '2026-04-15',
    'revenue', '월 매출 $5,000 달성 시', '앱 베타 테스트 및 UX 피드백 제출',
    'https://mindflow.app/beta', '가입한 이메일 주소를 입력해주세요.',
    '2026-01-10T09:00:00Z', '이승현', '2026-01-10T09:00:00Z', 'active'
),
(
    'proj_002', 'FarmDirect - 산지직송 플랫폼', '박지영 / AgriBridge',
    '농가와 소비자를 직접 연결하는 산지직송 커머스. 중간 유통 마진을 없애 농가 수익을 높이고 소비자에게 합리적 가격을 제공합니다.',
    'ecommerce', 5000, 1.00, 50, 31, '2026-03-30',
    'funding', '시드 투자 유치 시', '플랫폼 회원가입 및 첫 구매 후 리뷰 작성',
    'https://farmdirect.co.kr/signup', '가입 아이디와 첫 구매 주문번호를 입력해주세요.',
    '2026-01-22T14:30:00Z', '박지영', '2026-01-22T14:30:00Z', 'active'
),
(
    'proj_003', 'CodeMentor AI - 코딩 교육 봇', '정태윤 / EduTech Co.',
    'GPT 기반 1:1 맞춤 코딩 튜터. 학습자의 수준을 실시간 파악하고 개인화된 커리큘럼과 코드 리뷰를 제공합니다.',
    'ai', 20000, 0.25, 200, 142, '2026-05-01',
    'milestone', '유료 회원 1,000명 달성 시', '2주간 봇 학습 세션 참여 및 피드백 보고서 제출',
    'https://codementor.ai/study', '학습 세션 완료 스크린샷 링크를 제출해주세요.',
    '2026-02-01T11:15:00Z', '정태윤', '2026-02-01T11:15:00Z', 'active'
),
(
    'proj_004', 'NeuroLink - BCI 스타트업', '최현석 / NeuroLink Inc.',
    '뇌-컴퓨터 인터페이스(BCI) 제어 소프트웨어. 생각만으로 기기를 제어하는 혁신적인 기술을 개발합니다.',
    'tech', 50000, 1.00, 10, 4, '2026-12-31',
    'exit', 'IPO 또는 M&A 시 지분 가치 실현', 'BCI 데이터 수집 실험 참여 (판교 오피스 방문)',
    'https://neurolink.tech/join', '실험 참여 확인증 사진을 업로드해주세요.',
    '2026-02-10T10:00:00Z', '최현석', '2026-02-10T10:00:00Z', 'active'
)
on conflict (id) do nothing;

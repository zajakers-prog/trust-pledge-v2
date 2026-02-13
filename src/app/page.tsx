"use client";

import Link from "next/link";
import { useStorage } from "@/lib/store";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function Home() {
  const { projects } = useStorage();

  // Calculate dynamic stats
  const totalProjects = projects.length;
  const totalContributors = projects.reduce((sum, p) => sum + p.currentMemberCount, 0);
  const totalPC = projects.reduce((sum, p) => sum + (p.totalPC * (p.currentMemberCount / p.targetMemberCount)), 0);

  return (
    <div className="view active" id="view-landing" style={{ display: 'block' }}>
      <div className="container">
        <section className="hero">
          <div className="hero-badge animate-in">Pledge Credit Protocol</div>
          <h1 className="animate-in animate-delay-1">
            초기 기여자의 도움은<br />
            <span className="gradient-text" style={{
              background: 'var(--gradient-trust)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>반드시 보상받아야 합니다</span>
          </h1>
          <p className="animate-in animate-delay-2">
            TrustPledge는 창업자와 초기 기여자 사이의 약속을 기술적으로 보증합니다.
            Pledge Credit(PC)으로 기여를 기록하고, 약속 이행 시 스테이블코인으로 정산됩니다.
          </p>
          <div className="hero-buttons animate-in animate-delay-3">
            <Link href="/maker">
              <Button size="large">프로젝트 등록하기</Button>
            </Link>
            <Link href="/contributor">
              <Button size="large" variant="secondary">기여할 프로젝트 찾기</Button>
            </Link>
          </div>
          <div className="stats-bar animate-in animate-delay-4">
            <div className="stat-item">
              <div className="stat-number">{totalProjects}</div>
              <div className="stat-label">등록 프로젝트</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{totalContributors}</div>
              <div className="stat-label">누적 기여자</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{Math.round(totalPC).toLocaleString()} PC</div>
              <div className="stat-label">발행된 Pledge Credit</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">법적 보호율</div>
            </div>
          </div>
        </section>

        {/* Pledge Credit Explainer */}
        <section className="credit-section">
          <h2 className="section-title" style={{ textAlign: "center" }}>Pledge Credit(PC)이란?</h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>기여의 가치를 측정하고, 미래 보상을 보증하는 플랫폼 고유 단위</p>
          <div className="credit-flow">
            <Card className="credit-step">
              <div className="credit-step-icon" style={{ background: "rgba(59,130,246,0.15)", color: "var(--accent-blue)" }}>1</div>
              <h3>기여 활동</h3>
              <p>피드백, 테스트, 홍보 등 프로젝트에 기여합니다</p>
            </Card>
            <Card className="credit-step">
              <div className="credit-step-icon" style={{ background: "rgba(251,191,36,0.15)", color: "var(--accent-gold)" }}>PC</div>
              <h3>PC 발급</h3>
              <p>기여 완료 시 약속된 Pledge Credit이 발급됩니다</p>
            </Card>
            <Card className="credit-step">
              <div className="credit-step-icon" style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-emerald)" }}>&#x2713;</div>
              <h3>약속 이행</h3>
              <p>프로젝트가 수익화되거나 창업자가 약속을 이행합니다</p>
            </Card>
            <Card className="credit-step">
              <div className="credit-step-icon" style={{ background: "rgba(6,182,212,0.15)", color: "var(--accent-cyan)" }}>$</div>
              <h3>스테이블코인 정산</h3>
              <p>PC가 USDC/USDT로 전환되어 지갑으로 지급됩니다</p>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-section">
          <h2 className="section-title" style={{ textAlign: 'center' }}>왜 Pledge Credit인가?</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>현금이 아닌 크레딧으로 설계한 이유</p>
          <div className="steps-grid">
            <Card className="step-card">
              <div className="step-number" style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-red)" }}>&#x2717;</div>
              <h3>현금 보상의 문제</h3>
              <p>즉시 현금 지급은 법적·세무적 분쟁 요소를 만듭니다. 초기 스타트업에게 현금 부담은 비현실적입니다.</p>
            </Card>
            <Card className="step-card">
              <div className="step-number">PC</div>
              <h3>크레딧의 장점</h3>
              <p>Pledge Credit은 '미래 보상 청구권'입니다. 법적 분쟁 없이 기여의 가치를 정확히 기록합니다.</p>
            </Card>
            <Card className="step-card">
              <div className="step-number" style={{ background: "rgba(6,182,212,0.15)", color: "var(--accent-cyan)" }}>$</div>
              <h3>스테이블코인 정산</h3>
              <p>프로젝트 수익화 시 PC는 1:1 또는 약속된 비율로 USDC/USDT 스테이블코인으로 전환됩니다.</p>
            </Card>
            <Card className="step-card">
              <div className="step-number" style={{ background: "rgba(16,185,129,0.15)", color: "var(--accent-emerald)" }}>&#x1F6E1;</div>
              <h3>법적 보호</h3>
              <p>PC 발급 기록은 법적 증거력을 가집니다. 리브랜딩·법인전환 시에도 청구권은 승계됩니다.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

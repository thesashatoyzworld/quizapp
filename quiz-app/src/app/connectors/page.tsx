import { Metadata } from 'next';
import { connectorsContent, validTypes, ConnectorType } from '@/data/connectors';
import { ScrollFix } from './ScrollFix';

export const metadata: Metadata = {
  title: 'Коннекторы | TheSasha',
  description: 'Программа "Коннекторы" — 12-недельная система для экспертов, которые хотят стабильно зарабатывать от 500 000 ₽/мес на своих знаниях',
};

export default async function ConnectorsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const rawType = params.type || 'invisible';

  // Validate type is one of the 5 valid types
  const type: ConnectorType = validTypes.includes(rawType as ConnectorType)
    ? (rawType as ConnectorType)
    : 'invisible';

  return (
    <>
      <ScrollFix />
      <div className="connectors-page">
        <div className="grid-bg" />
        <div className="scanlines" />

        <div className="result-page">
          {/* Hero Section */}
          <section className="connectors-section">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <span className="connectors-spots-badge">{connectorsContent.hero.spots}</span>
              </div>

              <h1
                className="hero-financial-amount"
                style={{
                  color: 'var(--danger)',
                  marginBottom: 'var(--space-sm)'
                }}
              >
                {connectorsContent.hero.headline}
              </h1>

              <p className="subtitle" style={{ marginBottom: 'var(--space-md)' }}>
                {connectorsContent.hero.subheadline}
              </p>

              <p className="result-body" style={{ textAlign: 'center' }}>
                {connectorsContent.hero.description}
              </p>
            </div>
          </section>

          {/* 3 Elements Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.threeElements.title}</h2>

            <div className="card">
              {connectorsContent.threeElements.items.map((item, index) => (
                <div key={index} className="reason-block">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <h3 className="result-h3">{item.title}</h3>
                      <p className="result-body">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* First 14 Days Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.firstDays.title}</h2>

            <div className="card">
              <p className="result-body" style={{ marginBottom: 'var(--space-md)' }}>
                {connectorsContent.firstDays.subtitle}
              </p>

              <ol className="steps-list">
                {connectorsContent.firstDays.items.map((item, index) => (
                  <li key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p className="result-body" style={{ marginBottom: 0 }}>{item}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 3 Whales Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.whales.title}</h2>

            <div className="card">
              <p className="result-body" style={{ marginBottom: 'var(--space-lg)' }}>
                {connectorsContent.whales.subtitle}
              </p>

              {connectorsContent.whales.items.map((item, index) => (
                <div key={index} className="reason-block">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <h3 className="result-h3">{item.title}</h3>
                      <p className="result-body">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Weeks 4-8 Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.weeks4to8.title}</h2>

            <div className="card">
              <p className="result-body" style={{ marginBottom: 'var(--space-md)' }}>
                {connectorsContent.weeks4to8.subtitle}
              </p>

              <ul className="result-list">
                {connectorsContent.weeks4to8.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* System Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.system.title}</h2>

            <div className="card">
              <p className="result-body" style={{ marginBottom: 'var(--space-lg)' }}>
                {connectorsContent.system.description}
              </p>

              <ol className="steps-list">
                {connectorsContent.system.steps.map((step, index) => (
                  <li key={index} className="step-item">
                    <div className="step-number">{step.step}</div>
                    <div className="step-content">
                      <h3 className="result-h3" style={{ marginBottom: 'var(--space-xs)' }}>{step.title}</h3>
                      <p className="result-body" style={{ marginBottom: 0 }}>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Week 12 Results Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.week12.title}</h2>

            <div className="card">
              <p className="result-body" style={{ marginBottom: 'var(--space-lg)' }}>
                {connectorsContent.week12.subtitle}
              </p>

              <div className="stats-grid">
                {connectorsContent.week12.results.map((result, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-number">{result.metric}</span>
                    <span className="stat-label">{result.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3 Phases Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.phases.title}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {connectorsContent.phases.items.map((phase, index) => (
                <div
                  key={index}
                  className="connectors-phase-card"
                  style={{
                    borderLeftColor: phase.color,
                  }}
                >
                  <div
                    className="connectors-phase-label"
                    style={{ color: phase.color }}
                  >
                    {phase.phase}
                  </div>
                  <h3 className="connectors-phase-title">{phase.title}</h3>
                  <p className="connectors-phase-desc">{phase.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tiers Section */}
          <section className="connectors-section">
            <h2 className="section-title">{connectorsContent.tiers.title}</h2>

            <div className="connectors-tiers">
              {/* Basic Tier */}
              <div className="connectors-tier-card">
                <div className="connectors-tier-name">
                  {connectorsContent.tiers.basic.name}
                </div>
                <div className="connectors-tier-price">
                  {connectorsContent.tiers.basic.priceWeekly}
                </div>
                <div className="connectors-tier-total">
                  {connectorsContent.tiers.basic.priceTotal}
                </div>
                <ul className="connectors-tier-features">
                  {connectorsContent.tiers.basic.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="connectors-tier-card connectors-tier-card-premium">
                <div className="connectors-badge">Рекомендуем</div>
                <div className="connectors-tier-name">
                  {connectorsContent.tiers.premium.name}
                </div>
                <div className="connectors-tier-price">
                  {connectorsContent.tiers.premium.priceWeekly}
                </div>
                <div className="connectors-tier-total">
                  {connectorsContent.tiers.premium.priceTotal}
                </div>
                <ul className="connectors-tier-features">
                  {connectorsContent.tiers.premium.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Important Section */}
          <section className="connectors-section">
            <div className="card" style={{
              border: '2px solid var(--danger)',
              background: 'rgba(255, 42, 109, 0.05)'
            }}>
              <h3 className="result-h3" style={{
                color: 'var(--danger)',
                textAlign: 'center',
                marginBottom: 'var(--space-md)'
              }}>
                {connectorsContent.important.title}
              </h3>
              <p className="result-body" style={{ textAlign: 'center', marginBottom: 0 }}>
                {connectorsContent.important.text}
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="connectors-section">
            <div className="card card-cta">
              <h2 className="cta-title" style={{ marginBottom: 'var(--space-sm)' }}>
                {connectorsContent.cta.title}
              </h2>
              <p className="cta-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
                {connectorsContent.cta.subtitle}
              </p>

              <button
                className="btn-neon"
                disabled
                style={{
                  marginBottom: 'var(--space-md)',
                  cursor: 'not-allowed'
                }}
              >
                {connectorsContent.cta.buttonText}
              </button>

              <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                Оплата будет доступна скоро
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

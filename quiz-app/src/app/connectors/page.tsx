import { Metadata } from 'next';
import { getConnectorsContent } from '@/data/connectors';
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
  const type = params.type;

  // Get personalized content based on type param
  // No type or invalid type = base content (generic landing)
  // Valid type = merged personalized content
  const content = getConnectorsContent(type);

  return (
    <>
      <ScrollFix />
      <div className="connectors-page">
        <div className="grid-bg" />
        <div className="scanlines" />

        <div className="result-page">
          {/* Pre-qualifier */}
          <section className="connectors-section">
            <p className="connectors-prequalifier">{content.preQualifier.text}</p>
          </section>

          {/* Hero */}
          <section className="connectors-section">
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-lg)' }}>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <span className="connectors-spots-badge">{content.hero.spots}</span>
              </div>

              <h1 className="connectors-hero-headline">
                {content.hero.headline}
              </h1>

              <p className="connectors-hero-sub">
                {content.hero.subheadline}
              </p>

              <p className="result-body" style={{ textAlign: 'center', marginBottom: 0 }}>
                {content.hero.description}
              </p>
            </div>
          </section>

          {/* Problem (3 Elements) */}
          <section className="connectors-section">
            <h2 className="section-title">{content.threeElements.title}</h2>

            {content.threeElements.items.map((item, index) => (
              <div key={index} className="card connectors-element-card">
                <h3 className="connectors-element-title">{item.title}</h3>
                <p className="result-body" style={{ marginBottom: 0 }}>{item.description}</p>
              </div>
            ))}
          </section>

          {/* Belief Shift */}
          <section className="connectors-section">
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl) var(--space-lg)' }}>
              <h2 className="section-title" style={{ marginBottom: 'var(--space-xs)' }}>
                {content.beliefShift.title}
              </h2>
              <p className="connectors-hero-sub" style={{ marginBottom: 'var(--space-lg)' }}>
                {content.beliefShift.subtitle}
              </p>
              <p className="result-body" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                {content.beliefShift.text}
              </p>
              <div className="connectors-belief-shift">
                {content.beliefShift.shift}
              </div>
            </div>
          </section>

          {/* Solution (Whales) */}
          <section className="connectors-section">
            <h2 className="section-title">{content.whales.title}</h2>
            <p className="result-body" style={{ marginBottom: 'var(--space-md)' }}>
              {content.whales.subtitle}
            </p>

            {content.whales.items.map((item, index) => (
              <div key={index} className="card connectors-element-card">
                <h3 className="connectors-element-title">{item.title}</h3>
                <p className="result-body" style={{ marginBottom: 0 }}>{item.description}</p>
              </div>
            ))}
          </section>

          {/* Bio (Author) */}
          <section className="connectors-section">
            <h2 className="section-title">{content.author.title}</h2>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--space-sm)' }}>
                <span style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {content.author.name}
                </span>
              </div>
              <div style={{
                color: 'var(--neon-cyan)',
                fontSize: '0.9rem',
                marginBottom: 'var(--space-md)',
              }}>
                {content.author.handle}
              </div>
              <p className="result-body" style={{
                textAlign: 'center',
                marginBottom: 'var(--space-lg)',
              }}>
                {content.author.description}
              </p>
              <ul className="connectors-list" style={{ textAlign: 'left' }}>
                {content.author.facts.map((fact, index) => (
                  <li key={index}>{fact}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Timeline */}
          <section className="connectors-section">
            <h2 className="section-title">Как проходит программа</h2>

            {/* First 14 Days */}
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="connectors-element-title" style={{ marginBottom: 'var(--space-sm)' }}>
                {content.firstDays.title}
              </h3>
              <p className="result-body" style={{ marginBottom: 'var(--space-md)' }}>
                {content.firstDays.subtitle}
              </p>
              <ol className="steps-list">
                {content.firstDays.items.map((item, index) => (
                  <li key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p className="result-body" style={{ marginBottom: 0 }}>{item}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Weeks 4-8 */}
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="connectors-element-title" style={{ marginBottom: 'var(--space-sm)' }}>
                {content.weeks4to8.title}
              </h3>
              <p className="result-body" style={{ marginBottom: 'var(--space-md)' }}>
                {content.weeks4to8.subtitle}
              </p>
              <ul className="connectors-list">
                {content.weeks4to8.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Week 12 Results */}
            <div className="card">
              <h3 className="connectors-element-title" style={{ marginBottom: 'var(--space-sm)' }}>
                {content.week12.title}
              </h3>
              <p className="result-body" style={{ marginBottom: 'var(--space-lg)' }}>
                {content.week12.subtitle}
              </p>
              <div className="stats-grid">
                {content.week12.results.map((result, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-number">{result.metric}</span>
                    <span className="stat-label">{result.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Product Tour */}
          <section className="connectors-section">
            <h2 className="section-title">Что внутри программы</h2>

            {/* Connector System */}
            <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
              <h3 className="connectors-element-title" style={{ marginBottom: 'var(--space-sm)' }}>
                {content.system.title}
              </h3>
              <p className="result-body" style={{ marginBottom: 'var(--space-lg)' }}>
                {content.system.description}
              </p>
              <ol className="steps-list">
                {content.system.steps.map((step, index) => (
                  <li key={index} className="step-item">
                    <div className="step-number">{step.step}</div>
                    <div className="step-content">
                      <h3 className="connectors-element-title" style={{ marginBottom: 'var(--space-xs)' }}>{step.title}</h3>
                      <p className="result-body" style={{ marginBottom: 0 }}>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* 3 Phases */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {content.phases.items.map((phase, index) => (
                <div key={index} className="connectors-phase-card">
                  <div className="connectors-phase-card-border" style={{ background: phase.color }} />
                  <div className="connectors-phase-label" style={{ color: phase.color }}>
                    {phase.phase}
                  </div>
                  <h3 className="connectors-phase-title">{phase.title}</h3>
                  <p className="connectors-phase-desc">{phase.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing (Tiers) */}
          <section className="connectors-section">
            <h2 className="section-title">{content.tiers.title}</h2>

            <p className="result-body" style={{
              textAlign: 'center',
              marginBottom: 'var(--space-lg)',
              color: 'var(--neon-cyan)',
              fontWeight: 600,
            }}>
              {content.tiers.paymentNote}
            </p>

            <div className="connectors-tiers">
              {/* Basic Tier */}
              <div className="connectors-tier-card">
                <div className="connectors-tier-name">
                  {content.tiers.basic.name}
                </div>
                <div className="connectors-tier-price">
                  {content.tiers.basic.priceWeekly}
                </div>
                <div className="connectors-tier-total">
                  {content.tiers.basic.priceTotal}
                </div>
                <ul className="connectors-tier-features">
                  {content.tiers.basic.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="connectors-tier-card connectors-tier-card-premium">
                <div className="connectors-badge">Рекомендуем</div>
                <div className="connectors-tier-name">
                  {content.tiers.premium.name}
                </div>
                <div className="connectors-tier-price">
                  {content.tiers.premium.priceWeekly}
                </div>
                <div className="connectors-tier-total">
                  {content.tiers.premium.priceTotal}
                </div>
                <ul className="connectors-tier-features">
                  {content.tiers.premium.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Important */}
          <section className="connectors-section">
            <div className="card" style={{
              border: '2px solid var(--danger)',
              background: 'rgba(255, 42, 109, 0.05)'
            }}>
              <h3 className="connectors-element-title" style={{
                color: 'var(--danger)',
                textAlign: 'center',
                marginBottom: 'var(--space-md)'
              }}>
                {content.important.title}
              </h3>
              <p className="result-body" style={{ textAlign: 'center', marginBottom: 0 }}>
                {content.important.text}
              </p>
            </div>
          </section>

          {/* For You If */}
          <section className="connectors-section">
            <h2 className="section-title">{content.forYouIf.title}</h2>
            <div className="card">
              <ul className="connectors-checklist">
                {content.forYouIf.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="connectors-section">
            <div className="card card-cta">
              <h2 className="cta-title" style={{ marginBottom: 'var(--space-sm)' }}>
                {content.cta.title}
              </h2>
              <p className="cta-subtitle" style={{ marginBottom: 'var(--space-lg)' }}>
                {content.cta.subtitle}
              </p>

              <button
                className="btn-neon"
                disabled
                style={{
                  marginBottom: 'var(--space-md)',
                  cursor: 'not-allowed'
                }}
              >
                {content.cta.buttonText}
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

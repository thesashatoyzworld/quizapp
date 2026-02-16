type ValueStackItem = {
  item: string;
  value: string;
};

interface ValueStackProps {
  items: ValueStackItem[];
  basicPriceWeekly: string;
  premiumPriceWeekly: string;
}

export function ValueStack({ items, basicPriceWeekly, premiumPriceWeekly }: ValueStackProps) {
  const totalValue = items.reduce(
    (sum, item) => sum + parseInt(item.value.replace(/\s/g, ''), 10),
    0
  );
  const totalValueFormatted = totalValue.toLocaleString('ru-RU');

  // Basic = 120,000, ratio = total / 120000
  const basicTotal = 120000;
  const ratio = Math.round(totalValue / basicTotal);
  const barWidthActual = 10; // percentage width for actual price bar
  const barWidthValue = Math.min(barWidthActual * ratio, 100); // percentage width for value bar

  return (
    <div className="connectors-value-stack">
      {/* Item list with standalone values */}
      {items.map((item, index) => (
        <div key={index} className="connectors-value-item">
          <span className="connectors-value-item-name">{item.item}</span>
          <span className="connectors-value-item-price">{item.value} &#8381;</span>
        </div>
      ))}

      {/* Total value (crossed out) */}
      <div className="connectors-value-total">
        <span className="connectors-value-total-label">Общая ценность:</span>
        <span className="connectors-value-total-amount">{totalValueFormatted} &#8381;</span>
      </div>

      {/* 10:1 Value ratio visual */}
      <div className="connectors-value-ratio">
        <div className="connectors-value-ratio-row">
          <span className="connectors-value-ratio-label">Ценность</span>
          <div className="connectors-value-ratio-track">
            <div
              className="connectors-value-ratio-fill connectors-value-ratio-fill-value"
              style={{ width: `${barWidthValue}%` }}
            />
          </div>
          <span className="connectors-value-ratio-amount connectors-value-ratio-amount-value">
            {totalValueFormatted} &#8381;
          </span>
        </div>
        <div className="connectors-value-ratio-row">
          <span className="connectors-value-ratio-label">Цена</span>
          <div className="connectors-value-ratio-track">
            <div
              className="connectors-value-ratio-fill connectors-value-ratio-fill-price"
              style={{ width: `${barWidthActual}%` }}
            />
          </div>
          <span className="connectors-value-ratio-amount connectors-value-ratio-amount-price">
            от 120 000 &#8381;
          </span>
        </div>
        <div className="connectors-value-ratio-badge">
          {ratio}:1
        </div>
      </div>

      {/* Actual price */}
      <div className="connectors-value-actual">
        <p className="connectors-value-actual-title">Ваша стоимость:</p>
        <div className="connectors-value-actual-tiers">
          <div className="connectors-value-actual-tier">
            <span className="connectors-value-actual-tier-name">Базовый</span>
            <span className="connectors-value-actual-tier-price">{basicPriceWeekly}</span>
          </div>
          <div className="connectors-value-actual-tier connectors-value-actual-tier-premium">
            <span className="connectors-value-actual-tier-name">Премиум</span>
            <span className="connectors-value-actual-tier-price">{premiumPriceWeekly}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

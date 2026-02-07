import { Category } from './quiz';

// Type definitions for chart data
export interface RadarDataPoint {
  category: string;       // Short Russian label
  fullName: string;       // Full category name
  value: number;          // 0-100 normalized score
  maxValue: number;       // Always 100
}

export interface AudienceSegment {
  name: string;           // Russian label
  value: number;          // Percentage
  color: string;          // Hex color from cyberpunk palette
}

export interface FinancialData {
  currentIncome: number;        // Current estimated monthly income from social
  potentialIncome: number;      // Potential with proper content
  lostPerMonth: number;         // Monthly gap
  label: string;                // "Потенциал роста" label text
}

export interface LevelData {
  level: number;                // 1-5
  name: string;                 // Russian result name
  allLevels: { level: number; name: string; id: Category }[];  // Full 5-level path
}

export interface ChartData {
  radar: RadarDataPoint[];
  audience: AudienceSegment[];
  financial: FinancialData;
  levelData: LevelData;
}

// Shared level data for all result types
const ALL_LEVELS = [
  { level: 1, name: 'Невидимый эксперт', id: 'invisible' as Category },
  { level: 2, name: 'Делатель', id: 'doer' as Category },
  { level: 3, name: 'Щедрый эксперт', id: 'generous' as Category },
  { level: 4, name: 'Нестабильный', id: 'unstable' as Category },
  { level: 5, name: 'Готовы к масштабированию', id: 'scale' as Category },
];

// Radar dimensions — universal across all result types
const RADAR_DIMENSIONS = [
  { key: 'expertise', short: 'Экспертиза', full: 'Уровень экспертизы' },
  { key: 'visibility', short: 'Видимость', full: 'Видимость в соцсетях' },
  { key: 'content', short: 'Контент', full: 'Качество контента' },
  { key: 'sales', short: 'Продажи', full: 'Продажи через контент' },
  { key: 'system', short: 'Система', full: 'Системность подхода' },
];

// Audience colors from cyberpunk palette
const AUDIENCE_COLORS = {
  Клиенты: '#00f0ff',       // cyan
  Студенты: '#ff00aa',       // magenta
  Случайные: '#9d4edd',      // purple
  Рекомендации: '#ffd700',   // gold
  Любопытные: '#00ff88',     // green
};

// Predefined radar profiles per result type
// Values reflect the narrative from result page text
const RADAR_PROFILES: Record<Category, number[]> = {
  // [expertise, visibility, content, sales, system]
  invisible: [75, 10, 15, 10, 5],    // Great expert, zero visibility
  doer: [60, 40, 55, 15, 10],        // Lots of content but chaotic, no system
  generous: [80, 65, 70, 15, 40],     // High expertise & content, zero sales
  unstable: [75, 60, 65, 55, 25],     // Good results but inconsistent, no system
  scale: [90, 85, 80, 75, 70],        // Strong across the board, ready to scale
};

// Get radar data from predefined profile
function getRadarData(resultId: Category): RadarDataPoint[] {
  const profile = RADAR_PROFILES[resultId];

  return RADAR_DIMENSIONS.map((dim, i) => ({
    category: dim.short,
    fullName: dim.full,
    value: profile[i],
    maxValue: 100,
  }));
}

// Get audience segments by result type
function getAudienceSegments(resultId: Category): AudienceSegment[] {
  const audienceData: Record<Category, AudienceSegment[]> = {
    invisible: [
      { name: 'Рекомендации', value: 85, color: AUDIENCE_COLORS.Рекомендации },
      { name: 'Случайные', value: 15, color: AUDIENCE_COLORS.Случайные },
    ],
    doer: [
      { name: 'Случайные', value: 60, color: AUDIENCE_COLORS.Случайные },
      { name: 'Любопытные', value: 30, color: AUDIENCE_COLORS.Любопытные },
      { name: 'Клиенты', value: 10, color: AUDIENCE_COLORS.Клиенты },
    ],
    generous: [
      { name: 'Студенты', value: 85, color: AUDIENCE_COLORS.Студенты },
      { name: 'Клиенты', value: 15, color: AUDIENCE_COLORS.Клиенты },
    ],
    unstable: [
      { name: 'Клиенты', value: 45, color: AUDIENCE_COLORS.Клиенты },
      { name: 'Случайные', value: 35, color: AUDIENCE_COLORS.Случайные },
      { name: 'Студенты', value: 20, color: AUDIENCE_COLORS.Студенты },
    ],
    scale: [
      { name: 'Клиенты', value: 75, color: AUDIENCE_COLORS.Клиенты },
      { name: 'Случайные', value: 25, color: AUDIENCE_COLORS.Случайные },
    ],
  };

  return audienceData[resultId];
}

// Get financial data by result type
function getFinancialData(resultId: Category): FinancialData {
  const financialData: Record<Category, FinancialData> = {
    invisible: {
      currentIncome: 22500,      // Midpoint of 0-45000 (0-3 * 15000)
      potentialIncome: 300000,   // Midpoint of 225000-375000 (15-25 * 15000)
      lostPerMonth: 300000,      // Midpoint of 200000-400000
      label: 'Потенциал роста',
    },
    doer: {
      currentIncome: 30000,      // Midpoint of 15000-45000
      potentialIncome: 300000,   // Midpoint of 225000-375000
      lostPerMonth: 300000,      // Midpoint of 200000-400000
      label: 'Потенциал роста',
    },
    generous: {
      currentIncome: 60000,      // Estimated from context (1-3 paying from crowd)
      potentialIncome: 375000,   // Higher potential
      lostPerMonth: 315000,      // Midpoint of 180000-450000
      label: 'Потенциал роста',
    },
    unstable: {
      currentIncome: 127500,     // Average: good (11.5*15000) + bad (3*15000) / 2
      potentialIncome: 267500,   // Consistent good months: 15*15000
      lostPerMonth: 140000,      // Midpoint of 80000-200000
      label: 'Потенциал роста',
    },
    scale: {
      currentIncome: 300000,     // Already at good level (15-25 range midpoint)
      potentialIncome: 850000,   // With scaling (300000 + midpoint 300000-800000)
      lostPerMonth: 550000,      // Midpoint of 300000-800000
      label: 'Потенциал масштабирования',
    },
  };

  return financialData[resultId];
}

// Get level data by result type
function getLevelData(resultId: Category): LevelData {
  const levelMap: Record<Category, number> = {
    invisible: 1,
    doer: 2,
    generous: 3,
    unstable: 4,
    scale: 5,
  };

  return {
    level: levelMap[resultId],
    name: ALL_LEVELS[levelMap[resultId] - 1].name,
    allLevels: ALL_LEVELS,
  };
}

/**
 * Get complete chart data for a result type
 * @param resultId - The result category ID
 * @param scores - Quiz scores for all categories
 * @returns Complete chart data structure
 */
export function getChartData(resultId: Category): ChartData {
  return {
    radar: getRadarData(resultId),
    audience: getAudienceSegments(resultId),
    financial: getFinancialData(resultId),
    levelData: getLevelData(resultId),
  };
}

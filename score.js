import questions from './assets/questions.json';

const WORLD_AVG_CO2 = 120;   // g per 11-question set baseline
const WORLD_SCORE = 250;     // midpoint on 0-500 scale
const SCALE_MAX = 500;

export function totalCo2(responses) {
  // Ensure responses is an array and calculate total CO2
  if (!Array.isArray(responses)) return 0;
  
  return responses.reduce((sum, response) => {
    const q = questions.find(q => q.id === response.id);
    if (!q) return sum;
    
    const value = Math.max(0, Number(response.value || 0)); // Ensure non-negative
    return sum + (q.co2PerUnit * value);
  }, 0);
}

export function toScore(grams) {
  // Ensure grams is non-negative
  const co2Amount = Math.max(0, Number(grams) || 0);
  
  // Higher CO2 = lower score, lower CO2 = higher score
  // World average (120g) should give 250 points
  // 0g should give 500 points
  // High emissions should approach 0 points
  
  if (co2Amount === 0) return SCALE_MAX;
  
  // Calculate score where lower emissions = higher score
  const ratio = co2Amount / WORLD_AVG_CO2;
  let score;
  
  if (ratio <= 1) {
    // Better than world average: score between 250-500
    score = WORLD_SCORE + (WORLD_SCORE * (1 - ratio));
  } else {
    // Worse than world average: score between 0-250
    score = WORLD_SCORE / ratio;
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(SCALE_MAX, score));
  return Math.round(score);
}

export function relatable(co2) {
  const items = require('./assets/relatable.json');
  return items.slice(0, 5).map(item => ({
    ...item,
    units: Math.max(0.1, (co2 / item.co2PerUnit)).toFixed(1),
  }));
}
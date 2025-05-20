export function predictDelay(dayOfWeekId, airportId) {
  // Replace this with actual model logic
  // For demonstration, return random values
  const delayChance = Math.random(); // 0 to 1
  const confidence = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
  return {
    delayChance,
    confidence
  };
}

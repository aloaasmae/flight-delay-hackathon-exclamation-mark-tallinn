import { predictDelay } from '../logic/predict.js';

export async function predict(request, reply) {
  reply.type('application/json');
  const { dayOfWeekId, airportId } = request.body;
  const result = predictDelay(dayOfWeekId, airportId);
  return {
    delayChance: result.delayChance,
    confidence: result.confidence
  };
}

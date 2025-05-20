import { predictDelay } from '../logic/predict.js';

export async function predict(request, reply) {
  reply.type('application/json');
  const { dayOfWeekId, airportId } = request.body;
  try {
    const result = await predictDelay(dayOfWeekId, airportId);
    return {
      delayChance: result.delayChance,
      confidence: result.confidence
    };
  } catch (err) {
    reply.code(500);
    return { error: err.message };
  }
}

import { predictDelay } from '../logic/predict.js';

export async function predict(request, reply) {
  reply.type('application/json');
  if (!request.body || typeof request.body !== 'object') {
    request.log.warn('Empty or invalid JSON body');
    reply.code(400);
    return { error: 'Request body must be a valid JSON object with dayOfWeekId and airportId' };
  }
  const { dayOfWeekId, airportId } = request.body;
  if (dayOfWeekId === undefined || airportId === undefined) {
    request.log.warn('Missing dayOfWeekId or airportId in request body');
    reply.code(400);
    return { error: 'dayOfWeekId and airportId are required in the request body' };
  }
  request.log.info({ dayOfWeekId, airportId }, 'Received prediction request');
  try {
    const result = await predictDelay(dayOfWeekId, airportId);
    request.log.info({ result }, 'Prediction result');
    return {
      delayChance: result.delayChance,
      confidence: result.confidence
    };
  } catch (err) {
    request.log.error({ err }, 'Prediction error');
    reply.code(500);
    return { error: err.message };
  }
}

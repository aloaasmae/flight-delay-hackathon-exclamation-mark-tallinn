import { PredictRequestSchema, PredictResponseSchema } from '../schemas.js';
import { predict } from '../controllers/predictController.js';

export default function (fastify, opts, done) {
  fastify.post('/predict', {
    schema: {
      body: PredictRequestSchema,
      response: {
        200: PredictResponseSchema
      }
    }
  }, predict);
  done();
}

import { PredictRequestSchema, PredictResponseSchema } from '../schemas.js';
import { predict } from '../controllers/predictController.js';

export default function (fastify, opts, done) {
  fastify.log.info('Registering /predict route');
  // Wrap the controller to inject logger into logic
  fastify.post('/predict', {
    schema: {
      body: PredictRequestSchema,
      response: {
        200: PredictResponseSchema
      }
    }
  }, (req, reply) => predict(req, reply, fastify.log));
  done();
}

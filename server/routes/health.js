import { healthCheck } from '../controllers/healthController.js';

export default function (fastify, opts, done) {
  fastify.get('/health', healthCheck);
  done();
}

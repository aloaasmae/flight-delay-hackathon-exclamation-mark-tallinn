import fastifyModule from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import healthRoutes from './routes/health.js';
import predictRoutes from './routes/predict.js';
import airportsRoutes from './routes/airports.js';

const fastify = fastifyModule({ logger: true });

(async () => {
  await fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Flight Delay API',
        description: 'API documentation for Flight Delay Prediction Service',
        version: '1.0.0'
      }
    }
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });

  fastify.register(healthRoutes);
  fastify.register(predictRoutes);
  fastify.register(airportsRoutes);

  const start = async () => {
    try {
      await fastify.listen({ port: 3000, host: '0.0.0.0' });
      fastify.log.info('Server listening on http://0.0.0.0:3000');
      fastify.log.info('Swagger docs available at http://0.0.0.0:3000/docs');
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  await start();
})();

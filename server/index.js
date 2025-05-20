// Fastify API backend base for flight delay prediction service

import fastifyModule from 'fastify';
import { Type } from '@sinclair/typebox';
import { PredictRequestSchema, PredictResponseSchema, AirportsResponseSchema } from './schemas.js';
import healthRoutes from './routes/health.js';
import predictRoutes from './routes/predict.js';
import airportsRoutes from './routes/airports.js';

const fastify = fastifyModule({ logger: true });

// Health check endpoint
fastify.register(healthRoutes);
fastify.register(predictRoutes);
fastify.register(airportsRoutes);

// Mock model prediction function
function predictDelay(dayOfWeekId, airportId) {
  // Replace this with actual model logic
  // For demonstration, return random values
  const delayChance = Math.random(); // 0 to 1
  const confidence = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
  return {
    delayChance,
    confidence
  };
}

// Example airport data
const airports = [
  { id: 1, name: 'Amsterdam Schiphol' },
  { id: 2, name: 'Berlin Brandenburg' },
  { id: 3, name: 'Copenhagen Kastrup' },
  // ...add more airports as needed...
];

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://0.0.0.0:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

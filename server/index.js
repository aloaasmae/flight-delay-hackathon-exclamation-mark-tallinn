// Fastify API backend base for flight delay prediction service

const fastify = require('fastify')({ logger: true });
const { Type } = require('@sinclair/typebox');
const {
  PredictRequestSchema,
  PredictResponseSchema,
  AirportsResponseSchema
} = require('./schemas');

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  reply.type('application/json');
  return { status: 'ok' };
});

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

// Prediction endpoint
fastify.post('/predict', {
  schema: {
    body: PredictRequestSchema,
    response: {
      200: PredictResponseSchema
    }
  }
}, async (request, reply) => {
  reply.type('application/json');
  const { dayOfWeekId, airportId } = request.body;
  const result = predictDelay(dayOfWeekId, airportId);
  return {
    delayChance: result.delayChance,
    confidence: result.confidence
  };
});

// Airports list endpoint
fastify.get('/airports', {
  schema: {
    response: {
      200: AirportsResponseSchema
    }
  }
}, async (request, reply) => {
  reply.type('application/json');
  return airports.slice().sort((a, b) => a.name.localeCompare(b.name));
});

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

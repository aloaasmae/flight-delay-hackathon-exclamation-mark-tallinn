import { PredictRequestSchema, PredictResponseSchema } from '../schemas.js';
import fs from 'fs';
import path from 'path';

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function predictFromJson(model, input) {
  const coefs = model.coef[0];
  const intercept = model.intercept[0];
  const features = model.features;
  const x = features.map(f => Number(input[f]));
  const linear = coefs.reduce((sum, coef, i) => sum + coef * x[i], 0) + intercept;
  return sigmoid(linear);
}

export default function (fastify, opts, done) {
  fastify.post('/predict', {
    schema: {
      body: PredictRequestSchema,
      response: {
        200: PredictResponseSchema
      }
    }
  }, (req, reply) => {
    const modelPath = path.join(process.cwd(), 'data', 'flight_delay_model.json');
    const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    const { dayOfWeekId, airportId } = req.body;

    const input = {
      DayOfWeek: dayOfWeekId,
      OriginAirportID: airportId
    };
    const probability = predictFromJson(model, input);

    if (Number.isNaN(probability)) {
      reply.code(500).send({ error: 'Prediction failed due to invalid input or model.' });
      return;
    }

    reply.send({
      delayChance: probability,
      confidence: 1
    });
  });
  done();
}

import { AirportsResponseSchema } from '../schemas.js';
import { listAirports } from '../controllers/airportsController.js';

export default function (fastify, opts, done) {
  fastify.get('/airports', {
    schema: {
      response: {
        200: AirportsResponseSchema
      }
    }
  }, listAirports);
  done();
}

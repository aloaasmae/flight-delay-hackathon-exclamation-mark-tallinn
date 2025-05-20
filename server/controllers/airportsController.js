import { getAirports } from '../logic/airports.js';

export async function listAirports(request, reply) {
  reply.type('application/json');
  const sortedAirports = getAirports();
  return sortedAirports;
}

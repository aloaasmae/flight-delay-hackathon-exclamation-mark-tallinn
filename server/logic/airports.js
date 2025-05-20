import fs from 'fs';
import path from 'path';

const airportsFilePath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../data/airports.json'
);

function loadAirports() {
  const data = fs.readFileSync(airportsFilePath, 'utf-8');
  return JSON.parse(data);
}

export function getAirports() {
  const airports = loadAirports();
  // Map to expected format: { id, name }
  return airports
    .map(a => ({ id: a.originAirportId, name: a.originAirportName }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

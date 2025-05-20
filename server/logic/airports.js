const airports = [
  { id: 1, name: 'Amsterdam Schiphol' },
  { id: 2, name: 'Berlin Brandenburg' },
  { id: 3, name: 'Copenhagen Kastrup' },
  // ...add more airports as needed...
];

export function getAirports() {
  return airports.slice().sort((a, b) => a.name.localeCompare(b.name));
}

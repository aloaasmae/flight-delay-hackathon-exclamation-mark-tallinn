import { Type } from '@sinclair/typebox';

export const PredictRequestSchema = Type.Object({
  dayOfWeekId: Type.Integer(),
  airportId: Type.Integer()
});

export const PredictResponseSchema = Type.Object({
  delayChance: Type.Number(),
  confidence: Type.Number()
});

export const AirportsResponseSchema = Type.Array(
  Type.Object({
    id: Type.Integer(),
    name: Type.String()
  })
);

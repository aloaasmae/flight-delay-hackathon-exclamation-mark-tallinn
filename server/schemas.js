const { Type } = require('@sinclair/typebox');

const PredictRequestSchema = Type.Object({
  dayOfWeekId: Type.Integer(),
  airportId: Type.Integer()
});

const PredictResponseSchema = Type.Object({
  delayChance: Type.Number(),
  confidence: Type.Number()
});

const AirportsResponseSchema = Type.Array(
  Type.Object({
    id: Type.Integer(),
    name: Type.String()
  })
);

module.exports = {
  PredictRequestSchema,
  PredictResponseSchema,
  AirportsResponseSchema
};

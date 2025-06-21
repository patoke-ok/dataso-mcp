export default {
  type: 'function',
  function: {
    name: 'get_match_recommendations',
    description: 'Devuelve recomendaciones de partidos para una fecha, temporada y liga específicas.',
    parameters: {
      type: 'object',
      properties: {
        season: {
          type: 'string',
          description: 'La temporada de fútbol, por ejemplo: 2023'
        },
        date: {
          type: 'string',
          description: 'Fecha del partido en formato YYYY-MM-DD'
        },
        league: {
          type: 'string',
          description: 'ID de la liga (por ejemplo: 39 para Premier League)'
        }
      },
      required: ['season', 'date', 'league']
    }
  }
};
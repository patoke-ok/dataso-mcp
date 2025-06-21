import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Endpoint MCP Tools
app.get('/mcp/tools', (req, res) => {
  res.json([
    {
      type: 'function',
      function: {
        name: 'get_match_recommendations',
        description: 'Devuelve recomendaciones de partidos para una fecha, temporada y liga específicas.',
        parameters: {
          type: 'object',
          properties: {
            season: { type: 'string', description: 'Temporada de fútbol, ej: 2023' },
            date: { type: 'string', description: 'Fecha del partido en formato YYYY-MM-DD' },
            league: { type: 'string', description: 'ID de liga, ej: 39 para Premier League' }
          },
          required: ['season', 'date', 'league']
        }
      }
    }
  ]);
});

// Endpoint MCP Invoke
app.post('/mcp/invoke', async (req, res) => {
  const { season, date, league } = req.body?.tool_input || {};

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?season=${season}&date=${date}&league=${league}`, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
      }
    });

    const data = await response.json();

    const recommendations = (data.response || []).map(match => ({
      home: match.teams.home.name,
      away: match.teams.away.name,
      league: match.league.name,
      date: match.fixture.date
    }));

    res.json({ recommendations });

  } catch (error) {
    console.error('❌ Error en /mcp/invoke:', error);
    res.status(500).json({ error: 'Error interno al obtener datos de partidos' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ MCP Server corriendo en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', err => {
  console.error('❌ uncaughtException:', err);
});

process.on('unhandledRejection', reason => {
  console.error('❌ unhandledRejection:', reason);
});

// Keep-alive para evitar que Railway duerma el server
setInterval(() => {
  fetch("https://dataso-mcp-production.up.railway.app/mcp/tools")
    .then(res => console.log('🔁 Keep-alive ping enviado'))
    .catch(err => console.error('Ping error:', err));
}, 60_000); // cada 60 segundos

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Endpoint GET para que OpenAI cargue las tools
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
            season: {
              type: 'string',
              description: 'La temporada de fútbol, por ejemplo: 2023',
            },
            date: {
              type: 'string',
              description: 'Fecha del partido en formato YYYY-MM-DD',
            },
            league: {
              type: 'string',
              description: 'ID de la liga (por ejemplo: 39 para Premier League)',
            },
          },
          required: ['season', 'date', 'league'],
        }
      }
    }
  ]);
});

// Endpoint POST para ejecutar la función
app.post('/mcp/invoke', async (req, res) => {
  const { tool_call_id, function: func } = req.body;

  try {
    const { season, date, league } = JSON.parse(func.arguments || '{}');

    const url = `https://v3.football.api-sports.io/fixtures?season=${season}&league=${league}&date=${date}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const matches = data.response;

    const recommendations = matches.map(match => ({
      home: match.teams.home.name,
      away: match.teams.away.name,
      league: match.league.name,
      date: match.fixture.date
    }));

    return res.json([
      {
        tool_call_id,
        role: 'tool',
        name: 'get_match_recommendations',
        content: JSON.stringify({ recommendations }),
      }
    ]);
  } catch (error) {
    console.error('🔴 Error real:', error);
    return res.status(500).json({ error: 'Error interno en MCP Server' });
  }
});

app.listen(PORT, () => console.log(`✅ MCP Server activo en puerto ${PORT}`));

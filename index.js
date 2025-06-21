import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Endpoint MCP: /mcp/tools
app.get('/mcp/tools', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send([
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
    }
  ]);
});

// Endpoint MCP: /api/invoke
app.post('/api/invoke', async (req, res) => {
  try {
    const { season, date, league } = req.body;

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

    if (!matches || matches.length === 0) {
      return res.json({ recommendations: [] });
    }

    const recommendations = matches.map(match => ({
      home: match.teams.home.name,
      away: match.teams.away.name,
      league: match.league.name,
      date: match.fixture.date
    }));

    return res.json({ recommendations });

  } catch (error) {
    console.error('🔴 Error real:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => console.log(`✅ MCP Server activo en puerto ${PORT}`));

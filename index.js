import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 👉 Endpoint requerido por OpenAI para listar herramientas
app.get('/tools', (req, res) => {
  return res.json([
    {
      type: 'function',
      function: {
        name: 'get_match_recommendations',
        description: 'Devuelve los partidos de una liga y fecha específica.',
        parameters: {
          type: 'object',
          properties: {
            season: {
              type: 'string',
              description: 'Temporada futbolística (por ejemplo, "2023")'
            },
            league: {
              type: 'string',
              description: 'ID de la liga (por ejemplo, "39" para Premier League)'
            },
            date: {
              type: 'string',
              description: 'Fecha en formato YYYY-MM-DD (por ejemplo, "2023-08-12")'
            }
          },
          required: ['season', 'league', 'date']
        }
      }
    }
  ]);
});

// 👉 Endpoint para invocar la función desde OpenAI o Postman
app.post('/invoke', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (name !== 'get_match_recommendations') {
    return res.status(400).json({ error: 'Función no soportada.' });
  }

  try {
    const { season, league, date } = JSON.parse(args || '{}');

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

app.listen(PORT, () => {
  console.log(`✅ Servidor MCP corriendo en puerto ${PORT}`);
});

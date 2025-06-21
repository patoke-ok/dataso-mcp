import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.post('/api/invoke', async (req, res) => {
  try {
    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date();
    const formattedDate = '2023-08-12';

    const url = `https://v3.football.api-sports.io/fixtures?season=2023&league=39&date=${formattedDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': 'f3e2c541c4fafadfaa8da57bd2705e8b'
,
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

app.listen(PORT, () => console.log(`✅ Servidor MCP corriendo en puerto ${PORT}`));

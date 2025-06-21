import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.post('/api/invoke', async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=2023-05-20&league=39&season=2022`, {
      method: 'GET',
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
      }
    });

    const data = await response.json();
    console.log('🔴 Error real:', data);

    const recommendations = data.response?.map(fixture => ({
      fixture: fixture.fixture,
      teams: fixture.teams,
      league: fixture.league
    })) || [];

    res.json({ recommendations });
  } catch (error) {
    console.error('🛑 Error del servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor MCP corriendo en puerto ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/invoke', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${today}&league=140&season=2024`, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY
      }
    });

    const recommendations = response.data.response.map(match => ({
      fixtureId: match.fixture.id,
      home: match.teams.home.name,
      away: match.teams.away.name,
      recommend: "Más de 1.5 goles"
    }));

    res.json({ recommendations });
  } catch (error) {
    console.error('Error real:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor MCP corriendo en puerto ${PORT}`));

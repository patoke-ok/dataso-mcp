const express = require('express');
import fetch from 'node-fetch';
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;

// ✅ Usa la variable de entorno, o una fija si está vacía
const apiKey = process.env.API_FOOTBALL_KEY || '7e3c9726a6176020df02c1e4f539e375';

console.log('🔑 Usando API Key:', apiKey);

app.post('/api/invoke', async (req, res) => {
  try {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?league=39&season=2022', {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey
      }
    });

    const data = await response.json();

    // 💡 Ejemplo: recomendaciones ficticias
    const recommendations = data.response.slice(0, 3).map(match => ({
      fixtureId: match.fixture.id,
      date: match.fixture.date,
      home: match.teams.home.name,
      away: match.teams.away.name,
      recommend: "Más de 1.5 goles"
    }));

    res.json({ recommendations });
  } catch (error) {
    console.error('🔴 Error real:', error);
    res.status(500).json({ error: "Error interno" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor MCP corriendo en puerto ${PORT}`);
});

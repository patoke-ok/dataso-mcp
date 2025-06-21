import fetch from 'node-fetch';

export default async function execute({ season, date, league }) {
  const url = `https://v3.football.api-sports.io/fixtures?season=${season}&league=${league}&date=${date}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-apisports-key': process.env.API_FOOTBALL_KEY,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  const matches = data.response || [];

  const recommendations = matches.map(match => ({
    home: match.teams.home.name,
    away: match.teams.away.name,
    league: match.league.name,
    date: match.fixture.date
  }));

  return { recommendations };
}
/**
 * Mock Data Service
 * Provides test data for API endpoints without database
 */

const mockClubs = [
  {
    id: 1,
    name: 'Manchester United',
    country: 'England',
    league: 'Premier League',
    founded: 1878,
    stadium: 'Old Trafford',
    manager: 'Erik ten Hag'
  },
  {
    id: 2,
    name: 'Manchester City',
    country: 'England',
    league: 'Premier League',
    founded: 1880,
    stadium: 'Etihad Stadium',
    manager: 'Pep Guardiola'
  },
  {
    id: 3,
    name: 'Liverpool FC',
    country: 'England',
    league: 'Premier League',
    founded: 1892,
    stadium: 'Anfield',
    manager: 'Jurgen Klopp'
  },
  {
    id: 4,
    name: 'Real Madrid',
    country: 'Spain',
    league: 'La Liga',
    founded: 1902,
    stadium: 'Santiago Bernabéu',
    manager: 'Carlo Ancelotti'
  },
  {
    id: 5,
    name: 'Barcelona',
    country: 'Spain',
    league: 'La Liga',
    founded: 1899,
    stadium: 'Camp Nou',
    manager: 'Xavi Hernández'
  }
];

const mockPlayers = [
  {
    id: 1,
    name: 'Erling Haaland',
    position: 'ST',
    club: 'Manchester City',
    age: 24,
    nationality: 'Norway',
    rating: 91,
    is_available: false,
    market_value_eur: 180000000
  },
  {
    id: 2,
    name: 'Vinícius Júnior',
    position: 'LW',
    club: 'Real Madrid',
    age: 23,
    nationality: 'Brazil',
    rating: 89,
    is_available: false,
    market_value_eur: 150000000
  },
  {
    id: 3,
    name: 'Jude Bellingham',
    position: 'CM',
    club: 'Real Madrid',
    age: 20,
    nationality: 'England',
    rating: 87,
    is_available: false,
    market_value_eur: 120000000
  },
  {
    id: 4,
    name: 'Phil Foden',
    position: 'LM',
    club: 'Manchester City',
    age: 23,
    nationality: 'England',
    rating: 86,
    is_available: false,
    market_value_eur: 100000000
  },
  {
    id: 5,
    name: 'Rodrygo',
    position: 'RW',
    club: 'Real Madrid',
    age: 22,
    nationality: 'Brazil',
    rating: 84,
    is_available: false,
    market_value_eur: 80000000
  }
];

const mockNews = [
  {
    id: 1,
    title: 'Manchester City Wins Premier League Title',
    content: 'Manchester City clinched the Premier League title with a decisive victory over Liverpool.',
    source: 'Sports News Daily',
    published_at: new Date().toISOString(),
    category: 'League News',
    sentiment: 'positive'
  },
  {
    id: 2,
    title: 'Real Madrid Advances in Champions League',
    content: 'Real Madrid defeated Bayern Munich in an exciting Champions League quarter-final match.',
    source: 'European Football Weekly',
    published_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'Champions League',
    sentiment: 'positive'
  },
  {
    id: 3,
    title: 'New Transfer Window Rules Announced',
    content: 'European football organizations announced new transfer regulations for the upcoming window.',
    source: 'Football Executive',
    published_at: new Date(Date.now() - 172800000).toISOString(),
    category: 'Transfer News',
    sentiment: 'neutral'
  }
];

module.exports = {
  mockClubs,
  mockPlayers,
  mockNews
};

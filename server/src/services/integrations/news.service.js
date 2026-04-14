function buildMockArticles(locale, limit) {
  const now = Date.now();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 5, 20));

  return Array.from({ length: safeLimit }).map((_, index) => ({
    title: `Sportify ${locale.toUpperCase()} headline ${index + 1}`,
    summary: `Auto-ingested mock article ${index + 1} for locale ${locale}`,
    content: `Mock content block ${index + 1}`,
    source: 'mock-feed',
    sourceUrl: `https://mock-feed.local/${locale}/${now}-${index + 1}`,
    locale,
    publishedAt: new Date(now - index * 60 * 1000).toISOString(),
  }));
}

async function fetchNewsFeed({ locale = 'en', limit = 5 }) {
  return buildMockArticles(locale, limit);
}

module.exports = {
  fetchNewsFeed,
};
const { prisma } = require('../../lib/prisma');
const { fetchNewsFeed } = require('../../services/integrations');

async function listNews({ locale, page, limit }) {
  const where = {
    isPublished: true,
    ...(locale ? { locale } : {}),
  };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.newsArticle.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total },
  };
}

async function createNews({ title, summary, content, source, sourceUrl, locale, publishedAt }) {
  return prisma.newsArticle.create({
    data: {
      title,
      summary,
      content,
      source,
      sourceUrl,
      locale,
      publishedAt: publishedAt || new Date(),
      isPublished: true,
    },
  });
}

async function getNewsById(id) {
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article || !article.isPublished) {
    throw new Error('News article not found');
  }

  return article;
}

async function ingestNews({ locale, limit }) {
  const feedItems = await fetchNewsFeed({ locale, limit });
  let inserted = 0;
  let skipped = 0;

  for (const item of feedItems) {
    const sourceUrl = item.sourceUrl || null;
    if (sourceUrl) {
      const existing = await prisma.newsArticle.findFirst({
        where: {
          sourceUrl,
          locale: item.locale || locale,
        },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }
    }

    await prisma.newsArticle.create({
      data: {
        title: item.title,
        summary: item.summary,
        content: item.content,
        source: item.source,
        sourceUrl,
        locale: item.locale || locale,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        isPublished: true,
      },
    });

    inserted += 1;
  }

  return {
    locale,
    requested: feedItems.length,
    inserted,
    skipped,
  };
}

module.exports = {
  listNews,
  createNews,
  getNewsById,
  ingestNews,
};
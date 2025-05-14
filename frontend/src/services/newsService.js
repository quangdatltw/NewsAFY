import {categorizeArticlesWithAI} from './newsCategorization';

export const fetchNews = async () => {
    const timing = {
        rssVnExpress: 0,
        vnExpressContent: 0,
        aiCategorization: 0,
        total: 0
    };

    const startTotal = performance.now();

    try {
        // Fetch RSS feeds
        const startVnExpressRss = performance.now();
        const vnExpressRssResponse = await fetch("https://vnexpress.net/rss/tin-moi-nhat.rss");
        const vnExpressXml = await vnExpressRssResponse.text();
        timing.rssVnExpress = performance.now() - startVnExpressRss;

        // Parse the XML content to get links
        const vnExpressLinks = parseRssFeed(vnExpressXml);

        // Fetch content for all links in parallel
        const startVnExpressContent = performance.now();
        const vnExpressContentPromises = vnExpressLinks.map(link => fetchArticleContent(link));
        const vnExpressArticles = await Promise.all(vnExpressContentPromises);
        timing.vnExpressContent = performance.now() - startVnExpressContent;
        console.log(vnExpressArticles);

        // Filter out articles with errors
        const validArticles = vnExpressArticles.filter(article => !article.error);

        // Categorize articles using AI
        const startAICategorization = performance.now();
        const categorizedArticles = await categorizeArticlesWithAI(validArticles);
        timing.aiCategorization = performance.now() - startAICategorization;

        // Set default category if missing
        const articlesWithCategories = categorizedArticles.map(article => ({
            ...article,
            category: article.category || 'general'
        }));


        timing.total = performance.now() - startTotal;

        // Log timing information
        console.log('Performance timing (ms):', timing);
        console.log('VnExpress article count:', validArticles.length);
        console.log('Categories distribution:', getCategoryCounts(articlesWithCategories));

        return {
            articles: articlesWithCategories,
            vnExpressCount: validArticles.length,
            categoryData: getCategoryCounts(articlesWithCategories)
        };
    } catch (error) {
        timing.total = performance.now() - startTotal;
        console.error("Error fetching news:", error);
        console.error('Performance timing at error (ms):', timing);
        return {articles: [], vnExpressCount: 0, categoryData: {}};
    }
};

// Helper function to count articles in each category
const getCategoryCounts = (articles) => {
    const counts = {all: articles.length};

    articles.forEach(article => {
        const category = article.category || 'general';
        counts[category] = (counts[category] || 0) + 1;
    });
    counts['general'] = 50;

    return counts;
};

export const parseRssFeed = (xmlText) => {
    try {
        // Create a new DOMParser
        const parser = new DOMParser();

        // Parse the XML string
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // Get all item elements
        const items = xmlDoc.querySelectorAll('item');

        // Initialize an array to store all the URLs
        const allLinks = [];

        // Loop through each item and extract only the link URL
        items.forEach(item => {
            const link = item.querySelector('link')?.textContent || '';

            // Only add non-empty links
            if (link) {
                allLinks.push(link);
            }
        });

        const linkCount = Math.min(50, allLinks.length);

        // Shuffle the array using Fisher-Yates algorithm
        for (let i = allLinks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allLinks[i], allLinks[j]] = [allLinks[j], allLinks[i]];
        }

        // Take the first 10 items from the shuffled array
        return allLinks.slice(0, linkCount);
    } catch (error) {
        console.error("Error parsing RSS feed:", error);
        return [];
    }
}

// Function to fetch article body content
export const fetchArticleContent = async (url) => {
    try {
        if (!url.includes('vnexpress.net')) {
            throw new Error('Unsupported news source');
        }

        const textResponse = await fetch(`/api/news/vnexpress/body-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url}),
        });

        const textData = await textResponse.json();

        return {
            url,
            source: 'vnexpress',
            title: textData.title || '',
            description: textData.description || '',
            metadata: textData.metadata || {},
            textContent: textData.body || null
        };
    } catch (error) {
        console.error(`Error fetching content for ${url}:`, error);
        return {
            url,
            source: 'vnexpress',
            title: '',
            description: '',
            metadata: {},
            textContent: null,
            error: error.message
        };
    }
}


export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
  relevanceScore: number;
  conflictKeywords: string[];
  location?: {
    country: string;
    region: string;
  };
}

export interface ConflictNews {
  articles: NewsArticle[];
  lastUpdated: Date;
  totalResults: number;
}

export class NewsService {
  private static instance: NewsService;
  private cache = new Map<string, { data: ConflictNews; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  async getConflictNews(keywords: string[] = ['conflict', 'war', 'crisis', 'violence', 'military']): Promise<ConflictNews> {
    const cacheKey = keywords.join(',');
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Try multiple news sources for better coverage
      const [newsApiResults, guardianResults, rssResults] = await Promise.allSettled([
        this.fetchFromNewsAPI(keywords),
        this.fetchFromGuardian(keywords),
        this.fetchFromRSS(keywords)
      ]);

      const allArticles: NewsArticle[] = [];

      if (newsApiResults.status === 'fulfilled') {
        allArticles.push(...newsApiResults.value);
      }
      if (guardianResults.status === 'fulfilled') {
        allArticles.push(...guardianResults.value);
      }
      if (rssResults.status === 'fulfilled') {
        allArticles.push(...rssResults.value);
      }

      // Remove duplicates and sort by relevance
      const uniqueArticles = this.removeDuplicates(allArticles);
      const sortedArticles = uniqueArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

      const result: ConflictNews = {
        articles: sortedArticles.slice(0, 50), // Limit to 50 most relevant
        lastUpdated: new Date(),
        totalResults: sortedArticles.length
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('News service error:', error);
      return {
        articles: [],
        lastUpdated: new Date(),
        totalResults: 0
      };
    }
  }

  private async fetchFromNewsAPI(keywords: string[]): Promise<NewsArticle[]> {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) return [];

    const query = keywords.join(' OR ');
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20`;

    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey }
    });

    if (!response.ok) throw new Error('NewsAPI request failed');

    const data = await response.json();
    return data.articles?.map((article: any) => this.transformNewsAPIArticle(article)) || [];
  }

  private async fetchFromGuardian(keywords: string[]): Promise<NewsArticle[]> {
    const apiKey = import.meta.env.VITE_GUARDIAN_API_KEY;
    if (!apiKey) return [];

    const query = keywords.join(' OR ');
    const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&show-fields=body,thumbnail&page-size=20&api-key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Guardian API request failed');

    const data = await response.json();
    return data.response?.results?.map((article: any) => this.transformGuardianArticle(article)) || [];
  }

  private async fetchFromRSS(keywords: string[]): Promise<NewsArticle[]> {
    // Use RSS feeds from major news sources (BBC, Reuters, etc.)
    const rssFeeds = [
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://www.reuters.com/rssFeed/worldNews',
      'https://rss.cnn.com/rss/edition.rss'
    ];

    const articles: NewsArticle[] = [];

    for (const feedUrl of rssFeeds) {
      try {
        // Use a CORS proxy for RSS feeds
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.contents) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
          
          items.forEach((item, index) => {
            const article = this.transformRSSItem(item, feedUrl, index);
            if (article && this.isConflictRelated(article.title + ' ' + article.description, keywords)) {
              articles.push(article);
            }
          });
        }
      } catch (error) {
        console.warn(`RSS feed error for ${feedUrl}:`, error);
      }
    }

    return articles;
  }

  private transformNewsAPIArticle(article: any): NewsArticle {
    return {
      id: `newsapi_${Date.now()}_${Math.random()}`,
      title: article.title || '',
      description: article.description || '',
      content: article.content || article.description || '',
      url: article.url || '',
      source: article.source?.name || 'NewsAPI',
      publishedAt: new Date(article.publishedAt),
      imageUrl: article.urlToImage,
      relevanceScore: this.calculateRelevanceScore(article.title + ' ' + article.description),
      conflictKeywords: this.extractConflictKeywords(article.title + ' ' + article.description),
      location: this.extractLocation(article.title + ' ' + article.description)
    };
  }

  private transformGuardianArticle(article: any): NewsArticle {
    return {
      id: `guardian_${article.id}`,
      title: article.webTitle || '',
      description: article.fields?.body?.substring(0, 200) + '...' || '',
      content: article.fields?.body || '',
      url: article.webUrl || '',
      source: 'The Guardian',
      publishedAt: new Date(article.webPublicationDate),
      imageUrl: article.fields?.thumbnail,
      relevanceScore: this.calculateRelevanceScore(article.webTitle + ' ' + (article.fields?.body || '')),
      conflictKeywords: this.extractConflictKeywords(article.webTitle + ' ' + (article.fields?.body || '')),
      location: this.extractLocation(article.webTitle + ' ' + (article.fields?.body || ''))
    };
  }

  private transformRSSItem(item: Element, feedUrl: string, index: number): NewsArticle | null {
    const title = item.querySelector('title')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    if (!title || !link) return null;

    return {
      id: `rss_${feedUrl}_${index}`,
      title,
      description,
      content: description,
      url: link,
      source: this.getSourceFromFeedUrl(feedUrl),
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
      relevanceScore: this.calculateRelevanceScore(title + ' ' + description),
      conflictKeywords: this.extractConflictKeywords(title + ' ' + description),
      location: this.extractLocation(title + ' ' + description)
    };
  }

  private calculateRelevanceScore(text: string): number {
    const conflictTerms = [
      'war', 'conflict', 'violence', 'military', 'attack', 'bombing', 'crisis',
      'sanctions', 'invasion', 'occupation', 'refugee', 'casualties', 'ceasefire',
      'peace', 'negotiation', 'humanitarian', 'security', 'terrorism', 'insurgency'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const matches = words.filter(word => conflictTerms.some(term => word.includes(term)));
    
    return Math.min(matches.length / words.length * 10, 1);
  }

  private extractConflictKeywords(text: string): string[] {
    const keywords = [
      'war', 'conflict', 'violence', 'military', 'attack', 'bombing', 'crisis',
      'sanctions', 'invasion', 'occupation', 'refugee', 'casualties', 'ceasefire',
      'peace', 'negotiation', 'humanitarian', 'security', 'terrorism', 'insurgency'
    ];

    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  private extractLocation(text: string): { country: string; region: string } | undefined {
    // Simple location extraction - could be enhanced with NLP
    const countries = [
      'Ukraine', 'Russia', 'Israel', 'Palestine', 'Syria', 'Iraq', 'Afghanistan',
      'Yemen', 'Libya', 'Sudan', 'Ethiopia', 'Myanmar', 'China', 'Taiwan'
    ];

    const foundCountry = countries.find(country => 
      text.toLowerCase().includes(country.toLowerCase())
    );

    if (foundCountry) {
      return {
        country: foundCountry,
        region: this.getRegionForCountry(foundCountry)
      };
    }

    return undefined;
  }

  private getRegionForCountry(country: string): string {
    const regionMap: { [key: string]: string } = {
      'Ukraine': 'Eastern Europe',
      'Russia': 'Eastern Europe',
      'Israel': 'Middle East',
      'Palestine': 'Middle East',
      'Syria': 'Middle East',
      'Iraq': 'Middle East',
      'Afghanistan': 'Central Asia',
      'Yemen': 'Middle East',
      'Libya': 'North Africa',
      'Sudan': 'North Africa',
      'Ethiopia': 'East Africa',
      'Myanmar': 'Southeast Asia',
      'China': 'East Asia',
      'Taiwan': 'East Asia'
    };

    return regionMap[country] || 'Unknown';
  }

  private getSourceFromFeedUrl(feedUrl: string): string {
    if (feedUrl.includes('bbc')) return 'BBC';
    if (feedUrl.includes('reuters')) return 'Reuters';
    if (feedUrl.includes('cnn')) return 'CNN';
    return 'RSS Feed';
  }

  private isConflictRelated(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const key = article.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

export const newsService = NewsService.getInstance();

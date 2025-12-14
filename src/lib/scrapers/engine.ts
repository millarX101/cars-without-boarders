/**
 * Base Scraper Engine
 * Handles rate limiting, retries, user-agent rotation, and error handling
 */

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  delayBetweenRequests: number; // ms
  maxRetries: number;
  timeout: number; // ms
  respectRobotsTxt?: boolean;
}

export interface ScrapeResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  retries: number;
  duration: number;
}

// Common user agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

export class ScraperEngine {
  private config: ScraperConfig;
  private requestCount = 0;
  private failureCount = 0;
  private successCount = 0;
  private lastRequestTime = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Get a random user agent
   */
  private getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  /**
   * Delay execution
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Ensure minimum delay between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.delayBetweenRequests) {
      const waitTime = this.config.delayBetweenRequests - timeSinceLastRequest;
      // Add some randomness to avoid detection (±20%)
      const jitter = waitTime * 0.2 * (Math.random() - 0.5);
      await this.delay(waitTime + jitter);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch a URL with retry logic
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    await this.enforceRateLimit();
    this.requestCount++;

    const headers = {
      'User-Agent': this.getRandomUserAgent(),
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-AU,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      ...options.headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, attempt) * 5000;

          console.warn(`[${this.config.name}] Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${this.config.maxRetries}`);
          await this.delay(waitTime);
          continue;
        }

        // Handle blocks
        if (response.status === 403) {
          this.failureCount++;
          console.error(`[${this.config.name}] Access forbidden (403) for ${url}`);
          throw new Error('Access forbidden - possible IP block');
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.successCount++;
        return response;
      } catch (error) {
        lastError = error as Error;
        this.failureCount++;

        if (attempt < this.config.maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.warn(`[${this.config.name}] Request failed (attempt ${attempt}/${this.config.maxRetries}). Retrying in ${backoffTime}ms...`);
          await this.delay(backoffTime);
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Fetch and parse HTML
   */
  async fetchHtml(url: string): Promise<string> {
    const response = await this.fetch(url);
    return response.text();
  }

  /**
   * Get scraper statistics
   */
  getStats(): {
    requests: number;
    successes: number;
    failures: number;
    successRate: number;
  } {
    return {
      requests: this.requestCount,
      successes: this.successCount,
      failures: this.failureCount,
      successRate: this.requestCount > 0
        ? (this.successCount / this.requestCount) * 100
        : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.requestCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
  }

  /**
   * Check if scraper health is good (success rate > 80%)
   */
  isHealthy(): boolean {
    if (this.requestCount < 10) return true; // Not enough data
    return (this.successCount / this.requestCount) >= 0.8;
  }
}

/**
 * Create a Carsales scraper instance
 */
export function createCarsalesScraper(): ScraperEngine {
  return new ScraperEngine({
    name: 'Carsales',
    baseUrl: 'https://www.carsales.com.au',
    delayBetweenRequests: 3000, // 3 seconds
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  });
}

/**
 * Create a Gumtree scraper instance
 */
export function createGumtreeScraper(): ScraperEngine {
  return new ScraperEngine({
    name: 'Gumtree',
    baseUrl: 'https://www.gumtree.com.au',
    delayBetweenRequests: 4000, // 4 seconds (more conservative)
    maxRetries: 3,
    timeout: 30000,
  });
}

/**
 * Parse price string to number
 */
export function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;

  // Remove currency symbols, commas, and whitespace
  const cleaned = priceStr.replace(/[$,\s]/g, '');

  // Handle "POA", "Contact seller", etc.
  if (!/^\d+/.test(cleaned)) return null;

  // Extract numeric value
  const match = cleaned.match(/(\d+)/);
  if (!match) return null;

  const price = parseInt(match[1], 10);

  // Sanity check - car prices should be reasonable
  if (price < 1000 || price > 2000000) return null;

  return price;
}

/**
 * Parse odometer string to number
 */
export function parseOdometer(odometerStr: string): number | null {
  if (!odometerStr) return null;

  const cleaned = odometerStr.replace(/[,\s]/g, '').toLowerCase();
  const match = cleaned.match(/(\d+)/);

  if (!match) return null;

  return parseInt(match[1], 10);
}

/**
 * Parse year from string
 */
export function parseYear(yearStr: string): number | null {
  if (!yearStr) return null;

  const match = yearStr.match(/(19|20)\d{2}/);
  if (!match) return null;

  const year = parseInt(match[0], 10);
  const currentYear = new Date().getFullYear();

  // Sanity check - reasonable car years
  if (year < 1980 || year > currentYear + 1) return null;

  return year;
}

/**
 * Extract Australian state from location string
 */
export function extractState(location: string): string | null {
  if (!location) return null;

  const statePatterns: Record<string, RegExp> = {
    NSW: /\b(nsw|new\s*south\s*wales)\b/i,
    VIC: /\b(vic|victoria)\b/i,
    QLD: /\b(qld|queensland)\b/i,
    SA: /\b(sa|south\s*australia)\b/i,
    WA: /\b(wa|western\s*australia)\b/i,
    TAS: /\b(tas|tasmania)\b/i,
    ACT: /\b(act|australian\s*capital\s*territory|canberra)\b/i,
    NT: /\b(nt|northern\s*territory|darwin)\b/i,
  };

  for (const [state, pattern] of Object.entries(statePatterns)) {
    if (pattern.test(location)) {
      return state;
    }
  }

  return null;
}

/**
 * Normalize transmission value
 */
export function normalizeTransmission(transmission: string): string | null {
  if (!transmission) return null;

  const lower = transmission.toLowerCase();

  if (lower.includes('auto') || lower.includes('cvt') || lower.includes('dsg')) {
    return 'automatic';
  }
  if (lower.includes('manual')) {
    return 'manual';
  }

  return 'other';
}

/**
 * Normalize fuel type
 */
export function normalizeFuelType(fuelType: string): string | null {
  if (!fuelType) return null;

  const lower = fuelType.toLowerCase();

  if (lower.includes('electric') && !lower.includes('hybrid')) {
    return 'electric';
  }
  if (lower.includes('plug-in') || lower.includes('phev')) {
    return 'plug-in-hybrid';
  }
  if (lower.includes('hybrid')) {
    return 'hybrid';
  }
  if (lower.includes('diesel')) {
    return 'diesel';
  }
  if (lower.includes('petrol') || lower.includes('unleaded')) {
    return 'petrol';
  }
  if (lower.includes('lpg')) {
    return 'lpg';
  }

  return 'other';
}

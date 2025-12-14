/**
 * Carsales.com.au Scraper
 * Extracts car listings from Carsales search results
 */

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import {
  ScraperEngine,
  createCarsalesScraper,
  parsePrice,
  parseOdometer,
  parseYear,
  extractState,
  normalizeTransmission,
  normalizeFuelType,
} from './engine';
import type { CarListing, AustralianState } from '@/lib/types/car';

const BASE_URL = 'https://www.carsales.com.au';

export interface CarsalesSearchParams {
  query?: string;
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  state?: AustralianState;
  page?: number;
}

export interface CarsalesSearchResult {
  listings: Partial<CarListing>[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  searchUrl: string;
}

/**
 * Build search URL from parameters
 */
function buildSearchUrl(params: CarsalesSearchParams): string {
  const searchParams = new URLSearchParams();

  // Base path depends on make/model
  let path = '/cars/';
  if (params.make) {
    path += params.make.toLowerCase() + '/';
    if (params.model) {
      path += params.model.toLowerCase().replace(/\s+/g, '-') + '/';
    }
  }

  // Add query parameters
  if (params.query && !params.make) {
    searchParams.set('q', params.query);
  }

  if (params.minPrice) {
    searchParams.set('pricetype', 'Price');
    searchParams.set('pricefrom', params.minPrice.toString());
  }

  if (params.maxPrice) {
    searchParams.set('pricetype', 'Price');
    searchParams.set('priceto', params.maxPrice.toString());
  }

  if (params.minYear) {
    searchParams.set('yearfrom', params.minYear.toString());
  }

  if (params.maxYear) {
    searchParams.set('yearto', params.maxYear.toString());
  }

  if (params.state) {
    searchParams.set('State', params.state);
  }

  if (params.page && params.page > 1) {
    searchParams.set('offset', ((params.page - 1) * 12).toString());
  }

  // Sort by price ascending by default
  searchParams.set('sort', '~Price');

  const queryString = searchParams.toString();
  return `${BASE_URL}${path}${queryString ? '?' + queryString : ''}`;
}

/**
 * Parse listing card from search results
 */
function parseListingCard($: cheerio.CheerioAPI, element: Element): Partial<CarListing> | null {
  try {
    const $card = $(element);

    // Get the listing URL and ID
    const linkElement = $card.find('a[href*="/cars/details/"]').first();
    const href = linkElement.attr('href');

    if (!href) return null;

    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Extract ID from URL
    const idMatch = href.match(/SSE-AD-(\d+)/);
    const sourceId = idMatch ? idMatch[1] : href.split('/').filter(Boolean).pop() || '';

    // Get title
    const title = $card.find('[data-testid="listing-title"], .listing-item-title, h2, h3')
      .first()
      .text()
      .trim();

    if (!title) return null;

    // Parse make/model/year from title
    // Format usually: "2023 Mini Cooper SE"
    const titleParts = title.split(/\s+/);
    const yearFromTitle = parseYear(titleParts[0]);
    const make = titleParts[1] || '';
    const model = titleParts.slice(2).join(' ') || '';

    // Get price
    const priceText = $card.find('[data-testid="price"], .price, [class*="price"]')
      .first()
      .text()
      .trim();
    const price = parsePrice(priceText);

    if (!price) return null; // Skip listings without valid price

    // Get location
    const locationText = $card.find('[data-testid="seller-location"], .seller-location, [class*="location"]')
      .first()
      .text()
      .trim();
    const sellerState = extractState(locationText) as AustralianState || 'NSW';

    // Get odometer
    const odometerText = $card.find('[data-testid="odometer"], [class*="odometer"], [class*="kms"]')
      .first()
      .text()
      .trim();
    const odometer = parseOdometer(odometerText);

    // Get specs (transmission, fuel type)
    const specsText = $card.find('[data-testid="key-details"], .key-details, [class*="specs"]')
      .text()
      .toLowerCase();

    const transmission = normalizeTransmission(specsText);
    const fuelType = normalizeFuelType(specsText);

    // Get image
    const imageElement = $card.find('img').first();
    const imageSrc = imageElement.attr('data-src') || imageElement.attr('src') || '';
    const images = imageSrc ? [imageSrc] : [];

    // Determine seller type
    const isDealerBadge = $card.find('[class*="dealer"], [data-testid="dealer-badge"]').length > 0;
    const sellerType = isDealerBadge ? 'dealer' : 'private';

    return {
      source: 'carsales',
      sourceId,
      sourceUrl,
      make,
      model,
      year: yearFromTitle || new Date().getFullYear(),
      price,
      odometer: odometer ?? undefined,
      transmission: transmission as CarListing['transmission'],
      fuelType: fuelType as CarListing['fuelType'],
      sellerState,
      sellerType: sellerType as CarListing['sellerType'],
      title,
      images,
      isActive: true,
    };
  } catch (error) {
    console.error('Error parsing listing card:', error);
    return null;
  }
}

/**
 * Parse search results page
 */
function parseSearchResults(html: string, searchUrl: string): CarsalesSearchResult {
  const $ = cheerio.load(html);
  const listings: Partial<CarListing>[] = [];

  // Find listing cards - try multiple selectors
  const cardSelectors = [
    '[data-testid="listing-card"]',
    '.listing-item',
    '[class*="ListingCard"]',
    'article[class*="listing"]',
  ];

  let cards: cheerio.Cheerio<Element> | null = null;
  for (const selector of cardSelectors) {
    const selected = $(selector);
    if (selected.length > 0) {
      cards = selected as cheerio.Cheerio<Element>;
      break;
    }
  }

  if (!cards) return { listings, totalResults: 0, currentPage: 1, totalPages: 1, searchUrl };

  cards.each((_, element) => {
    const listing = parseListingCard($, element);
    if (listing) {
      listings.push(listing);
    }
  });

  // Get pagination info
  const totalResultsText = $('[data-testid="results-count"], .results-count, [class*="results"]')
    .first()
    .text();
  const totalMatch = totalResultsText.match(/(\d+)/);
  const totalResults = totalMatch ? parseInt(totalMatch[1], 10) : listings.length;

  const resultsPerPage = 12;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Get current page from URL
  const urlParams = new URLSearchParams(searchUrl.split('?')[1] || '');
  const offset = parseInt(urlParams.get('offset') || '0', 10);
  const currentPage = Math.floor(offset / resultsPerPage) + 1;

  return {
    listings,
    totalResults,
    currentPage,
    totalPages,
    searchUrl,
  };
}

/**
 * Scrape Carsales search results
 */
export async function scrapeCarsalesSearch(
  params: CarsalesSearchParams,
  scraper?: ScraperEngine
): Promise<CarsalesSearchResult> {
  const engine = scraper || createCarsalesScraper();
  const searchUrl = buildSearchUrl(params);

  console.log(`[Carsales] Scraping: ${searchUrl}`);

  const html = await engine.fetchHtml(searchUrl);
  const results = parseSearchResults(html, searchUrl);

  console.log(`[Carsales] Found ${results.listings.length} listings (page ${results.currentPage}/${results.totalPages})`);

  return results;
}

/**
 * Scrape multiple pages of search results
 */
export async function scrapeCarsalesMultiPage(
  params: CarsalesSearchParams,
  maxPages: number = 5
): Promise<{
  listings: Partial<CarListing>[];
  totalScraped: number;
  stats: ReturnType<ScraperEngine['getStats']>;
}> {
  const engine = createCarsalesScraper();
  const allListings: Partial<CarListing>[] = [];

  // First page
  const firstPage = await scrapeCarsalesSearch(params, engine);
  allListings.push(...firstPage.listings);

  const pagesToScrape = Math.min(maxPages, firstPage.totalPages);

  // Subsequent pages
  for (let page = 2; page <= pagesToScrape; page++) {
    try {
      const pageResults = await scrapeCarsalesSearch({ ...params, page }, engine);
      allListings.push(...pageResults.listings);

      // Check scraper health
      if (!engine.isHealthy()) {
        console.warn('[Carsales] Scraper health degraded. Stopping early.');
        break;
      }
    } catch (error) {
      console.error(`[Carsales] Error on page ${page}:`, error);
      break;
    }
  }

  return {
    listings: allListings,
    totalScraped: allListings.length,
    stats: engine.getStats(),
  };
}

/**
 * Scrape a single listing detail page
 */
export async function scrapeCarsalesListing(
  url: string,
  scraper?: ScraperEngine
): Promise<Partial<CarListing> | null> {
  const engine = scraper || createCarsalesScraper();

  try {
    const html = await engine.fetchHtml(url);
    const $ = cheerio.load(html);

    // Extract detailed information from listing page
    const title = $('h1').first().text().trim();
    const priceText = $('[data-testid="price"], .price').first().text();
    const price = parsePrice(priceText);

    // Get detailed specs
    const specs: Record<string, string> = {};
    $('[data-testid="specs-table"] tr, .specs-row, [class*="specification"]').each((_, row) => {
      const key = $(row).find('th, .spec-label, dt').text().trim().toLowerCase();
      const value = $(row).find('td, .spec-value, dd').text().trim();
      if (key && value) {
        specs[key] = value;
      }
    });

    // Get all images
    const images: string[] = [];
    $('[data-testid="gallery"] img, .gallery img, [class*="image-gallery"] img').each((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src');
      if (src && !images.includes(src)) {
        images.push(src);
      }
    });

    // Get description
    const description = $('[data-testid="description"], .description, [class*="seller-comment"]')
      .first()
      .text()
      .trim();

    // Get features
    const features: string[] = [];
    $('[data-testid="features"] li, .features li, [class*="feature-list"] li').each((_, li) => {
      const feature = $(li).text().trim();
      if (feature) {
        features.push(feature);
      }
    });

    return {
      sourceUrl: url,
      title,
      price: price || undefined,
      description,
      images,
      features,
      odometer: specs.odometer ? (parseOdometer(specs.odometer) ?? undefined) : undefined,
      transmission: specs.transmission ? normalizeTransmission(specs.transmission) as CarListing['transmission'] : undefined,
      fuelType: specs['fuel type'] ? normalizeFuelType(specs['fuel type']) as CarListing['fuelType'] : undefined,
      colour: specs.colour || specs.color,
      bodyType: specs['body type'] || specs.body,
    };
  } catch (error) {
    console.error(`[Carsales] Error scraping listing ${url}:`, error);
    return null;
  }
}

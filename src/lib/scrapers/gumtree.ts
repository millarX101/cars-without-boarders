/**
 * Gumtree.com.au Scraper
 * Extracts car listings from Gumtree search results
 */

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import {
  ScraperEngine,
  createGumtreeScraper,
  parsePrice,
  parseOdometer,
  parseYear,
  extractState,
  normalizeTransmission,
  normalizeFuelType,
} from './engine';
import type { CarListing, AustralianState } from '@/lib/types/car';

const BASE_URL = 'https://www.gumtree.com.au';

export interface GumtreeSearchParams {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  state?: AustralianState;
  page?: number;
}

export interface GumtreeSearchResult {
  listings: Partial<CarListing>[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  searchUrl: string;
}

// Gumtree category IDs
const CARS_CATEGORY = 'c18320'; // Cars, Vans & Utes

// State location codes for Gumtree
const STATE_LOCATION_CODES: Record<string, string> = {
  NSW: 'l3003435',
  VIC: 'l3008839',
  QLD: 'l3006258',
  SA: 'l3007524',
  WA: 'l3008859',
  TAS: 'l3008205',
  ACT: 'l3001057',
  NT: 'l3005775',
};

/**
 * Build search URL from parameters
 */
function buildSearchUrl(params: GumtreeSearchParams): string {
  const pathParts = ['s-cars-vans-utes'];

  // Add state if specified
  if (params.state && STATE_LOCATION_CODES[params.state]) {
    pathParts.push(params.state.toLowerCase());
  }

  // Build path
  let path = '/' + pathParts.join('/') + '/' + CARS_CATEGORY;

  if (params.state && STATE_LOCATION_CODES[params.state]) {
    path += STATE_LOCATION_CODES[params.state];
  }

  // Query parameters
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set('q', params.query);
  }

  if (params.minPrice) {
    searchParams.set('price__from', params.minPrice.toString());
  }

  if (params.maxPrice) {
    searchParams.set('price__to', params.maxPrice.toString());
  }

  if (params.minYear) {
    searchParams.set('carmake_year_from', params.minYear.toString());
  }

  if (params.maxYear) {
    searchParams.set('carmake_year_to', params.maxYear.toString());
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  const queryString = searchParams.toString();
  return `${BASE_URL}${path}${queryString ? '?' + queryString : ''}`;
}

/**
 * Parse listing card from search results
 */
function parseListingCard($: cheerio.CheerioAPI, element: Element): Partial<CarListing> | null {
  try {
    const $card = $(element);

    // Get the listing URL
    const linkElement = $card.find('a[href*="/s-ad/"]').first();
    let href = linkElement.attr('href');

    if (!href) {
      // Try alternate selector
      href = $card.find('a').first().attr('href');
    }

    if (!href || !href.includes('/s-ad/')) return null;

    const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

    // Extract ID from URL
    const idMatch = href.match(/\/(\d+)$/);
    const sourceId = idMatch ? idMatch[1] : href.split('/').filter(Boolean).pop() || '';

    // Get title
    const title = $card.find('[data-testid="ad-title"], .user-ad-title, h2 a, h3 a')
      .first()
      .text()
      .trim();

    if (!title) return null;

    // Parse make/model/year from title
    const titleParts = title.split(/\s+/);
    const yearFromTitle = parseYear(title);

    // Try to extract make/model - Gumtree titles are less structured
    let make = '';
    let model = '';

    // Common car makes to look for
    const commonMakes = [
      'Toyota', 'Mazda', 'Holden', 'Ford', 'Hyundai', 'Kia', 'Honda', 'Nissan',
      'Mitsubishi', 'Subaru', 'Volkswagen', 'BMW', 'Mercedes', 'Audi', 'Tesla',
      'Mini', 'Lexus', 'Jeep', 'Land Rover', 'Porsche', 'Volvo', 'Suzuki',
    ];

    for (const commonMake of commonMakes) {
      if (title.toLowerCase().includes(commonMake.toLowerCase())) {
        make = commonMake;
        // Try to get model after make
        const makeIndex = title.toLowerCase().indexOf(commonMake.toLowerCase());
        const afterMake = title.slice(makeIndex + commonMake.length).trim();
        model = afterMake.split(/\s+/).slice(0, 2).join(' ');
        break;
      }
    }

    // Get price
    const priceText = $card.find('[data-testid="ad-price"], .ad-price, [class*="price"]')
      .first()
      .text()
      .trim();
    const price = parsePrice(priceText);

    if (!price) return null;

    // Get location
    const locationText = $card.find('[data-testid="ad-location"], .ad-location, [class*="location"]')
      .first()
      .text()
      .trim();
    const sellerState = extractState(locationText) as AustralianState || 'NSW';

    // Get suburb from location
    const sellerSuburb = locationText.split(',')[0]?.trim();

    // Get attributes/specs
    const attrsText = $card.find('[data-testid="ad-attributes"], .ad-attributes, [class*="attribute"]')
      .text()
      .toLowerCase();

    const odometer = parseOdometer(attrsText);
    const transmission = normalizeTransmission(attrsText);
    const fuelType = normalizeFuelType(attrsText);

    // Get image
    const imageElement = $card.find('img').first();
    const imageSrc = imageElement.attr('data-src') || imageElement.attr('src') || '';
    const images = imageSrc && !imageSrc.includes('placeholder') ? [imageSrc] : [];

    // Gumtree is mostly private sellers
    const sellerType = 'private';

    return {
      source: 'gumtree',
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
      sellerSuburb,
      sellerType: sellerType as CarListing['sellerType'],
      title,
      images,
      isActive: true,
    };
  } catch (error) {
    console.error('Error parsing Gumtree listing card:', error);
    return null;
  }
}

/**
 * Parse search results page
 */
function parseSearchResults(html: string, searchUrl: string): GumtreeSearchResult {
  const $ = cheerio.load(html);
  const listings: Partial<CarListing>[] = [];

  // Find listing cards
  const cardSelectors = [
    '[data-testid="search-result"]',
    '.user-ad-row',
    '[class*="SearchResult"]',
    'article[class*="listing"]',
    '.search-results__item',
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
  const totalResultsText = $('[data-testid="results-count"], .search-results-page__results-title, [class*="results"]')
    .first()
    .text();
  const totalMatch = totalResultsText.match(/(\d+)/);
  const totalResults = totalMatch ? parseInt(totalMatch[1], 10) : listings.length;

  const resultsPerPage = 24; // Gumtree shows more per page
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Get current page from URL
  const urlParams = new URLSearchParams(searchUrl.split('?')[1] || '');
  const currentPage = parseInt(urlParams.get('page') || '1', 10);

  return {
    listings,
    totalResults,
    currentPage,
    totalPages,
    searchUrl,
  };
}

/**
 * Scrape Gumtree search results
 */
export async function scrapeGumtreeSearch(
  params: GumtreeSearchParams,
  scraper?: ScraperEngine
): Promise<GumtreeSearchResult> {
  const engine = scraper || createGumtreeScraper();
  const searchUrl = buildSearchUrl(params);

  console.log(`[Gumtree] Scraping: ${searchUrl}`);

  const html = await engine.fetchHtml(searchUrl);
  const results = parseSearchResults(html, searchUrl);

  console.log(`[Gumtree] Found ${results.listings.length} listings (page ${results.currentPage}/${results.totalPages})`);

  return results;
}

/**
 * Scrape multiple pages of search results
 */
export async function scrapeGumtreeMultiPage(
  params: GumtreeSearchParams,
  maxPages: number = 3
): Promise<{
  listings: Partial<CarListing>[];
  totalScraped: number;
  stats: ReturnType<ScraperEngine['getStats']>;
}> {
  const engine = createGumtreeScraper();
  const allListings: Partial<CarListing>[] = [];

  // First page
  const firstPage = await scrapeGumtreeSearch(params, engine);
  allListings.push(...firstPage.listings);

  const pagesToScrape = Math.min(maxPages, firstPage.totalPages);

  // Subsequent pages
  for (let page = 2; page <= pagesToScrape; page++) {
    try {
      const pageResults = await scrapeGumtreeSearch({ ...params, page }, engine);
      allListings.push(...pageResults.listings);

      if (!engine.isHealthy()) {
        console.warn('[Gumtree] Scraper health degraded. Stopping early.');
        break;
      }
    } catch (error) {
      console.error(`[Gumtree] Error on page ${page}:`, error);
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
export async function scrapeGumtreeListing(
  url: string,
  scraper?: ScraperEngine
): Promise<Partial<CarListing> | null> {
  const engine = scraper || createGumtreeScraper();

  try {
    const html = await engine.fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const priceText = $('[data-testid="ad-price"], .ad-price, [class*="price"]').first().text();
    const price = parsePrice(priceText);

    // Get attributes
    const attributes: Record<string, string> = {};
    $('[data-testid="ad-attributes"] li, .ad-attributes__item, [class*="attribute-row"]').each((_, row) => {
      const key = $(row).find('.attribute-name, dt, label').text().trim().toLowerCase();
      const value = $(row).find('.attribute-value, dd, span').text().trim();
      if (key && value) {
        attributes[key] = value;
      }
    });

    // Get images
    const images: string[] = [];
    $('[data-testid="gallery"] img, .carousel img, [class*="gallery"] img').each((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src');
      if (src && !src.includes('placeholder') && !images.includes(src)) {
        images.push(src);
      }
    });

    // Get description
    const description = $('[data-testid="ad-description"], .ad-description, [class*="description"]')
      .first()
      .text()
      .trim();

    return {
      sourceUrl: url,
      title,
      price: price || undefined,
      description,
      images,
      odometer: attributes.odometer ? (parseOdometer(attributes.odometer) ?? undefined) : undefined,
      transmission: attributes.transmission ? normalizeTransmission(attributes.transmission) as CarListing['transmission'] : undefined,
      fuelType: attributes['fuel type'] ? normalizeFuelType(attributes['fuel type']) as CarListing['fuelType'] : undefined,
      colour: attributes.colour || attributes.color,
      bodyType: attributes['body type'] || attributes.body,
    };
  } catch (error) {
    console.error(`[Gumtree] Error scraping listing ${url}:`, error);
    return null;
  }
}

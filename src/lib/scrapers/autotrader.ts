/**
 * AutoTrader Australia Scraper
 * Less protected, good selection of dealer and private listings
 */

import * as cheerio from 'cheerio';
import type { CarListing, AustralianState } from '@/lib/types/car';

const BASE_URL = 'https://www.autotrader.com.au';

interface AutoTraderSearchParams {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  state?: AustralianState;
  page?: number;
}

function mapState(stateText: string): AustralianState | null {
  const normalized = stateText.toLowerCase().trim();
  const stateMap: Record<string, AustralianState> = {
    'nsw': 'NSW', 'new south wales': 'NSW', 'sydney': 'NSW',
    'vic': 'VIC', 'victoria': 'VIC', 'melbourne': 'VIC',
    'qld': 'QLD', 'queensland': 'QLD', 'brisbane': 'QLD',
    'sa': 'SA', 'south australia': 'SA', 'adelaide': 'SA',
    'wa': 'WA', 'western australia': 'WA', 'perth': 'WA',
    'tas': 'TAS', 'tasmania': 'TAS', 'hobart': 'TAS',
    'act': 'ACT', 'canberra': 'ACT',
    'nt': 'NT', 'northern territory': 'NT', 'darwin': 'NT',
  };

  for (const [key, value] of Object.entries(stateMap)) {
    if (normalized.includes(key)) return value;
  }
  return null;
}

export async function searchAutoTrader(params: AutoTraderSearchParams): Promise<CarListing[]> {
  const listings: CarListing[] = [];

  try {
    // Build search URL - AutoTrader uses path-based params
    let url = `${BASE_URL}/cars`;
    if (params.make) url += `/${params.make.toLowerCase()}`;
    if (params.model) url += `/${params.model.toLowerCase()}`;

    const searchParams = new URLSearchParams();
    if (params.minPrice) searchParams.set('price_min', params.minPrice.toString());
    if (params.maxPrice) searchParams.set('price_max', params.maxPrice.toString());
    if (params.minYear) searchParams.set('year_min', params.minYear.toString());
    if (params.maxYear) searchParams.set('year_max', params.maxYear.toString());
    if (params.state) searchParams.set('state', params.state);
    if (params.page && params.page > 1) searchParams.set('page', params.page.toString());

    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`AutoTrader fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse listing cards - AutoTrader structure
    $('[data-testid="listing-card"], .listing-card, .vehicle-card').each((_, element) => {
      try {
        const $el = $(element);

        // Title and link
        const titleEl = $el.find('a[href*="/car/"], h2 a, .listing-title a').first();
        const title = titleEl.text().trim() || $el.find('h2, h3').first().text().trim();
        const href = titleEl.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

        // Parse year/make/model from title
        const titleParts = title.split(' ');
        const yearMatch = title.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

        // Price
        const priceText = $el.find('[data-testid="price"], .price, .listing-price').text();
        const priceMatch = priceText.replace(/[^0-9]/g, '');
        const price = priceMatch ? parseInt(priceMatch) : 0;

        // Location
        const locationText = $el.find('[data-testid="location"], .location, .dealer-location').text().trim();
        const sellerState = mapState(locationText);

        // Odometer
        const kmText = $el.find('[data-testid="odometer"], .odometer, .kms').text();
        const kmMatch = kmText.replace(/[^0-9]/g, '');
        const odometer = kmMatch ? parseInt(kmMatch) : undefined;

        // Specs
        const specsText = $el.text().toLowerCase();

        let fuelType: CarListing['fuelType'] = 'petrol';
        if (specsText.includes('diesel')) fuelType = 'diesel';
        else if (specsText.includes('electric') || specsText.includes('ev')) fuelType = 'electric';
        else if (specsText.includes('hybrid')) fuelType = 'hybrid';

        let transmission: CarListing['transmission'] = 'automatic';
        if (specsText.includes('manual')) transmission = 'manual';

        // Seller type
        const sellerType = specsText.includes('dealer') || specsText.includes('dealership') ? 'dealer' : 'private';

        // Image
        const imageEl = $el.find('img').first();
        const imageUrl = imageEl.attr('src') || imageEl.attr('data-src') || '';

        // Extract make from title or params
        const make = params.make || (titleParts.length > 1 ? titleParts[1] : '');
        const model = params.model || (titleParts.length > 2 ? titleParts[2] : '');

        if (price > 0 && sellerState) {
          listings.push({
            id: `autotrader-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: 'autotrader',
            sourceId: href.split('/').pop() || '',
            sourceUrl,
            make: make.charAt(0).toUpperCase() + make.slice(1).toLowerCase(),
            model: model.charAt(0).toUpperCase() + model.slice(1).toLowerCase(),
            variant: titleParts.slice(3).join(' ') || undefined,
            year,
            price,
            odometer,
            transmission,
            fuelType,
            sellerState,
            sellerSuburb: locationText.split(',')[0]?.trim(),
            sellerType,
            title,
            images: imageUrl ? [imageUrl] : [],
            features: [],
            isActive: true,
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error parsing AutoTrader listing:', err);
      }
    });

    return listings;
  } catch (error) {
    console.error('AutoTrader scraper error:', error);
    return [];
  }
}

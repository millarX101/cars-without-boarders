/**
 * CarsGuide Scraper
 * Less protected than Carsales, good for used car listings
 */

import * as cheerio from 'cheerio';
import type { CarListing, AustralianState } from '@/lib/types/car';

const BASE_URL = 'https://www.carsguide.com.au';

interface CarsGuideSearchParams {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  state?: AustralianState;
  fuelType?: string;
  transmission?: string;
  page?: number;
}

function mapState(stateText: string): AustralianState | null {
  const stateMap: Record<string, AustralianState> = {
    'nsw': 'NSW',
    'new south wales': 'NSW',
    'vic': 'VIC',
    'victoria': 'VIC',
    'qld': 'QLD',
    'queensland': 'QLD',
    'sa': 'SA',
    'south australia': 'SA',
    'wa': 'WA',
    'western australia': 'WA',
    'tas': 'TAS',
    'tasmania': 'TAS',
    'act': 'ACT',
    'nt': 'NT',
    'northern territory': 'NT',
  };
  return stateMap[stateText.toLowerCase()] || null;
}

function mapFuelType(fuel: string): CarListing['fuelType'] {
  const fuelMap: Record<string, CarListing['fuelType']> = {
    'petrol': 'petrol',
    'diesel': 'diesel',
    'electric': 'electric',
    'hybrid': 'hybrid',
    'plug-in hybrid': 'plug-in-hybrid',
    'lpg': 'lpg',
  };
  return fuelMap[fuel.toLowerCase()] || 'petrol';
}

function mapTransmission(trans: string): CarListing['transmission'] {
  if (trans.toLowerCase().includes('auto')) return 'automatic';
  if (trans.toLowerCase().includes('manual')) return 'manual';
  if (trans.toLowerCase().includes('cvt')) return 'cvt';
  return 'automatic';
}

export async function searchCarsGuide(params: CarsGuideSearchParams): Promise<CarListing[]> {
  const listings: CarListing[] = [];

  try {
    // Build search URL
    const searchParams = new URLSearchParams();
    if (params.make) searchParams.set('make', params.make.toLowerCase());
    if (params.model) searchParams.set('model', params.model.toLowerCase());
    if (params.minPrice) searchParams.set('price_min', params.minPrice.toString());
    if (params.maxPrice) searchParams.set('price_max', params.maxPrice.toString());
    if (params.minYear) searchParams.set('year_min', params.minYear.toString());
    if (params.maxYear) searchParams.set('year_max', params.maxYear.toString());
    if (params.state) searchParams.set('state', params.state.toLowerCase());
    if (params.page && params.page > 1) searchParams.set('page', params.page.toString());

    const url = `${BASE_URL}/buy-a-car?${searchParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`CarsGuide fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse listing cards
    $('.listing-item, .card-listing').each((_, element) => {
      try {
        const $el = $(element);

        // Extract basic info
        const titleEl = $el.find('.listing-title, .card-title, h2 a, h3 a').first();
        const title = titleEl.text().trim();
        const sourceUrl = titleEl.attr('href') || '';

        // Parse title for make/model/year
        const titleMatch = title.match(/^(\d{4})\s+(\w+)\s+(.+)$/);
        const year = titleMatch ? parseInt(titleMatch[1]) : new Date().getFullYear();
        const make = titleMatch ? titleMatch[2] : '';
        const modelVariant = titleMatch ? titleMatch[3] : title;

        // Extract price
        const priceText = $el.find('.price, .listing-price').text().trim();
        const priceMatch = priceText.replace(/[^0-9]/g, '');
        const price = priceMatch ? parseInt(priceMatch) : 0;

        // Extract location
        const locationText = $el.find('.location, .listing-location').text().trim();
        const locationParts = locationText.split(',').map(s => s.trim());
        const suburb = locationParts[0] || '';
        const stateText = locationParts[1] || '';
        const sellerState = mapState(stateText);

        // Extract specs
        const specsText = $el.find('.specs, .listing-specs').text().toLowerCase();
        const kmMatch = specsText.match(/(\d+,?\d*)\s*km/);
        const odometer = kmMatch ? parseInt(kmMatch[1].replace(',', '')) : undefined;

        // Fuel type
        let fuelType: CarListing['fuelType'] = 'petrol';
        if (specsText.includes('diesel')) fuelType = 'diesel';
        else if (specsText.includes('electric')) fuelType = 'electric';
        else if (specsText.includes('hybrid')) fuelType = 'hybrid';

        // Transmission
        let transmission: CarListing['transmission'] = 'automatic';
        if (specsText.includes('manual')) transmission = 'manual';

        // Images
        const imageEl = $el.find('img').first();
        const imageUrl = imageEl.attr('src') || imageEl.attr('data-src') || '';

        // Only add if we have essential data
        if (price > 0 && sellerState && make) {
          listings.push({
            id: `carsguide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: 'carsguide',
            sourceId: sourceUrl.split('/').pop() || '',
            sourceUrl: sourceUrl.startsWith('http') ? sourceUrl : `${BASE_URL}${sourceUrl}`,
            make,
            model: modelVariant.split(' ')[0] || modelVariant,
            variant: modelVariant.split(' ').slice(1).join(' ') || undefined,
            year,
            price,
            odometer,
            transmission,
            fuelType,
            sellerState,
            sellerSuburb: suburb,
            sellerType: 'dealer',
            title,
            images: imageUrl ? [imageUrl] : [],
            features: [],
            isActive: true,
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error parsing CarsGuide listing:', err);
      }
    });

    return listings;
  } catch (error) {
    console.error('CarsGuide scraper error:', error);
    return [];
  }
}

export async function getCarsGuideListingDetails(url: string): Promise<Partial<CarListing> | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract detailed info
    const description = $('.description, .listing-description').text().trim();
    const features: string[] = [];
    $('.features li, .feature-item').each((_, el) => {
      features.push($(el).text().trim());
    });

    const images: string[] = [];
    $('.gallery img, .carousel img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) images.push(src);
    });

    return {
      description,
      features,
      images,
    };
  } catch (error) {
    console.error('CarsGuide detail fetch error:', error);
    return null;
  }
}

/**
 * Australian Dealer Website Scraper
 * Searches official dealer websites by make
 * Most dealer sites have minimal bot protection
 */

import * as cheerio from 'cheerio';
import type { CarListing, AustralianState } from '@/lib/types/car';

// Dealer website configurations by make
export interface DealerConfig {
  make: string;
  name: string;
  usedCarsUrl: string;
  state: AustralianState;
  suburb: string;
  // CSS selectors for parsing
  selectors: {
    listingCard: string;
    title: string;
    price: string;
    link: string;
    image: string;
    year?: string;
    odometer?: string;
    specs?: string;
  };
}

// Australian dealer websites organized by make
export const DEALER_DATABASE: DealerConfig[] = [
  // === HONDA DEALERS ===
  {
    make: 'Honda',
    name: 'Trivett Honda Parramatta',
    usedCarsUrl: 'https://www.trivetthonda.com.au/used-cars',
    state: 'NSW',
    suburb: 'Parramatta',
    selectors: {
      listingCard: '.vehicle-card, .stock-item',
      title: '.vehicle-title, h3',
      price: '.price, .vehicle-price',
      link: 'a[href*="used"]',
      image: 'img',
    },
  },
  {
    make: 'Honda',
    name: 'Bartons Honda',
    usedCarsUrl: 'https://www.bartonshonda.com.au/used-vehicles',
    state: 'QLD',
    suburb: 'Capalaba',
    selectors: {
      listingCard: '.vehicle-item, .listing',
      title: '.title, h2',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  {
    make: 'Honda',
    name: 'Scotts Honda Adelaide',
    usedCarsUrl: 'https://www.scottshonda.com.au/used-cars',
    state: 'SA',
    suburb: 'Fullarton',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.vehicle-name',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === TOYOTA DEALERS ===
  {
    make: 'Toyota',
    name: 'Sydney City Toyota',
    usedCarsUrl: 'https://www.sydneycitytoyota.com.au/used-cars',
    state: 'NSW',
    suburb: 'Waterloo',
    selectors: {
      listingCard: '.vehicle-card, .stock-item',
      title: '.vehicle-title, h3',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  {
    make: 'Toyota',
    name: 'Patterson Cheney Toyota',
    usedCarsUrl: 'https://www.pattersoncheney.com.au/used-cars',
    state: 'VIC',
    suburb: 'Mentone',
    selectors: {
      listingCard: '.vehicle-listing',
      title: '.vehicle-title',
      price: '.vehicle-price',
      link: 'a',
      image: 'img',
    },
  },
  // === MAZDA DEALERS ===
  {
    make: 'Mazda',
    name: 'Toowong Mazda',
    usedCarsUrl: 'https://www.toowongmazda.com.au/used-vehicles',
    state: 'QLD',
    suburb: 'Toowong',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  {
    make: 'Mazda',
    name: 'Eagers Mazda',
    usedCarsUrl: 'https://www.eagersmazda.com.au/used-vehicles',
    state: 'QLD',
    suburb: 'Newstead',
    selectors: {
      listingCard: '.stock-item',
      title: '.stock-title',
      price: '.stock-price',
      link: 'a',
      image: 'img',
    },
  },
  // === HYUNDAI DEALERS ===
  {
    make: 'Hyundai',
    name: 'McGrath Hyundai Liverpool',
    usedCarsUrl: 'https://www.mcgrathhyundai.com.au/used-cars',
    state: 'NSW',
    suburb: 'Liverpool',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.vehicle-name',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  {
    make: 'Hyundai',
    name: 'Bartons Hyundai',
    usedCarsUrl: 'https://www.bartonshyundai.com.au/used-vehicles',
    state: 'QLD',
    suburb: 'Wynnum',
    selectors: {
      listingCard: '.vehicle-item',
      title: '.title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === KIA DEALERS ===
  {
    make: 'Kia',
    name: 'Kia Sydney',
    usedCarsUrl: 'https://www.sydneykia.com.au/used-vehicles',
    state: 'NSW',
    suburb: 'Rosebery',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.vehicle-title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === VOLKSWAGEN DEALERS ===
  {
    make: 'Volkswagen',
    name: 'Volkswagen Centre Sydney',
    usedCarsUrl: 'https://www.volkswagencentresydney.com.au/used-cars',
    state: 'NSW',
    suburb: 'Zetland',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === BMW DEALERS ===
  {
    make: 'BMW',
    name: 'Sydney BMW',
    usedCarsUrl: 'https://www.sydneybmw.com.au/used-vehicles',
    state: 'NSW',
    suburb: 'Rushcutters Bay',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.vehicle-name',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === MERCEDES DEALERS ===
  {
    make: 'Mercedes-Benz',
    name: 'Mercedes-Benz Sydney',
    usedCarsUrl: 'https://www.mbsydney.com.au/used-vehicles',
    state: 'NSW',
    suburb: 'Parramatta',
    selectors: {
      listingCard: '.vehicle-listing',
      title: '.vehicle-title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === FORD DEALERS ===
  {
    make: 'Ford',
    name: 'Stillwell Ford',
    usedCarsUrl: 'https://www.stillwellford.com.au/used-vehicles',
    state: 'VIC',
    suburb: 'Brighton',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === MITSUBISHI DEALERS ===
  {
    make: 'Mitsubishi',
    name: 'Nundah Mitsubishi',
    usedCarsUrl: 'https://www.nundahmitsubishi.com.au/used-vehicles',
    state: 'QLD',
    suburb: 'Nundah',
    selectors: {
      listingCard: '.stock-item',
      title: '.title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === SUBARU DEALERS ===
  {
    make: 'Subaru',
    name: 'City Subaru',
    usedCarsUrl: 'https://www.citysubaru.com.au/used-cars',
    state: 'NSW',
    suburb: 'Sydney',
    selectors: {
      listingCard: '.vehicle-card',
      title: '.vehicle-name',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
  // === NISSAN DEALERS ===
  {
    make: 'Nissan',
    name: 'Metro Nissan',
    usedCarsUrl: 'https://www.metronissan.com.au/used-vehicles',
    state: 'VIC',
    suburb: 'Windsor',
    selectors: {
      listingCard: '.vehicle-listing',
      title: '.title',
      price: '.price',
      link: 'a',
      image: 'img',
    },
  },
];

// Get dealers by make
export function getDealersByMake(make: string): DealerConfig[] {
  return DEALER_DATABASE.filter(
    (dealer) => dealer.make.toLowerCase() === make.toLowerCase()
  );
}

// Get all unique makes
export function getAvailableMakes(): string[] {
  return [...new Set(DEALER_DATABASE.map((d) => d.make))];
}

// Scrape a single dealer website
export async function scrapeDealerWebsite(dealer: DealerConfig): Promise<CarListing[]> {
  const listings: CarListing[] = [];

  try {
    const response = await fetch(dealer.usedCarsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.warn(`Dealer ${dealer.name} fetch failed: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(dealer.usedCarsUrl).origin;

    $(dealer.selectors.listingCard).each((_, element) => {
      try {
        const $el = $(element);

        // Title
        const title = $el.find(dealer.selectors.title).first().text().trim();
        if (!title) return;

        // Parse title for year/model
        const yearMatch = title.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

        // Price
        const priceText = $el.find(dealer.selectors.price).text();
        const priceMatch = priceText.replace(/[^0-9]/g, '');
        const price = priceMatch ? parseInt(priceMatch) : 0;

        // Link
        const linkEl = $el.find(dealer.selectors.link).first();
        const href = linkEl.attr('href') || '';
        const sourceUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;

        // Image
        const imageEl = $el.find(dealer.selectors.image).first();
        const imageUrl = imageEl.attr('src') || imageEl.attr('data-src') || '';

        // Odometer
        let odometer: number | undefined;
        if (dealer.selectors.odometer) {
          const kmText = $el.find(dealer.selectors.odometer).text();
          const kmMatch = kmText.replace(/[^0-9]/g, '');
          odometer = kmMatch ? parseInt(kmMatch) : undefined;
        } else {
          // Try to find km in the card
          const kmMatch = $el.text().match(/(\d{1,3},?\d{3})\s*km/i);
          odometer = kmMatch ? parseInt(kmMatch[1].replace(',', '')) : undefined;
        }

        // Try to extract model from title
        const titleWithoutYear = title.replace(/\d{4}/, '').trim();
        const parts = titleWithoutYear.split(' ').filter(Boolean);
        const model = parts.length > 1 ? parts[1] : parts[0] || '';
        const variant = parts.slice(2).join(' ') || undefined;

        // Fuel type detection
        const textLower = $el.text().toLowerCase();
        let fuelType: CarListing['fuelType'] = 'petrol';
        if (textLower.includes('diesel')) fuelType = 'diesel';
        else if (textLower.includes('electric') || textLower.includes('ev')) fuelType = 'electric';
        else if (textLower.includes('hybrid')) fuelType = 'hybrid';

        // Transmission
        let transmission: CarListing['transmission'] = 'automatic';
        if (textLower.includes('manual')) transmission = 'manual';

        if (price > 0) {
          listings.push({
            id: `dealer-${dealer.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            source: 'dealer',
            sourceId: href.split('/').pop() || '',
            sourceUrl,
            make: dealer.make,
            model,
            variant,
            year,
            price,
            odometer,
            transmission,
            fuelType,
            sellerState: dealer.state,
            sellerSuburb: dealer.suburb,
            sellerType: 'dealer',
            sellerName: dealer.name,
            title,
            images: imageUrl ? [imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`] : [],
            features: [],
            isActive: true,
            scrapedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`Error parsing listing from ${dealer.name}:`, err);
      }
    });

    return listings;
  } catch (error) {
    console.error(`Dealer scraper error for ${dealer.name}:`, error);
    return [];
  }
}

// Search dealers by make
export async function searchDealersByMake(
  make: string,
  options?: {
    state?: AustralianState;
    maxDealers?: number;
  }
): Promise<CarListing[]> {
  let dealers = getDealersByMake(make);

  if (options?.state) {
    dealers = dealers.filter((d) => d.state === options.state);
  }

  if (options?.maxDealers) {
    dealers = dealers.slice(0, options.maxDealers);
  }

  // Scrape all dealers in parallel
  const results = await Promise.allSettled(
    dealers.map((dealer) => scrapeDealerWebsite(dealer))
  );

  const allListings: CarListing[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allListings.push(...result.value);
    }
  });

  return allListings;
}

// Search all dealers
export async function searchAllDealers(
  options?: {
    make?: string;
    state?: AustralianState;
    maxDealers?: number;
  }
): Promise<CarListing[]> {
  let dealers = [...DEALER_DATABASE];

  if (options?.make) {
    dealers = dealers.filter(
      (d) => d.make.toLowerCase() === options.make!.toLowerCase()
    );
  }

  if (options?.state) {
    dealers = dealers.filter((d) => d.state === options.state);
  }

  if (options?.maxDealers) {
    dealers = dealers.slice(0, options.maxDealers);
  }

  const results = await Promise.allSettled(
    dealers.map((dealer) => scrapeDealerWebsite(dealer))
  );

  const allListings: CarListing[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allListings.push(...result.value);
    }
  });

  return allListings;
}

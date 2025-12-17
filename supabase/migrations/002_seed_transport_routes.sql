-- Seed transport route data
-- Based on real carrier quotes + 10% margin (December 2024)
-- Depot-to-depot rates for standard sedans

-- First clear existing data to avoid conflicts
DELETE FROM public.transport_routes;

INSERT INTO public.transport_routes (from_state, to_state, base_price, per_km_rate, estimated_days_min, estimated_days_max, notes)
VALUES
  -- NSW routes (based on Dec 2024 quotes)
  ('NSW', 'NSW', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('NSW', 'VIC', 770, 0, 2, 4, 'Sydney to Melbourne corridor'),
  ('NSW', 'QLD', 880, 0, 3, 5, 'Sydney to Brisbane corridor'),
  ('NSW', 'SA', 1100, 0, 4, 6, 'Sydney to Adelaide'),
  ('NSW', 'WA', 2200, 0, 7, 10, 'Cross-country to Perth'),
  ('NSW', 'TAS', 1320, 0, 4, 6, 'Includes ferry crossing'),
  ('NSW', 'ACT', 330, 0, 1, 2, 'Sydney to Canberra'),
  ('NSW', 'NT', 2420, 0, 6, 9, 'Sydney to Darwin'),

  -- VIC routes
  ('VIC', 'NSW', 770, 0, 2, 4, 'Melbourne to Sydney corridor'),
  ('VIC', 'VIC', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('VIC', 'QLD', 1210, 0, 4, 6, 'Melbourne to Brisbane'),
  ('VIC', 'SA', 770, 0, 2, 4, 'Melbourne to Adelaide'),
  ('VIC', 'WA', 2420, 0, 7, 10, 'Cross-country to Perth'),
  ('VIC', 'TAS', 880, 0, 3, 5, 'Includes Spirit of Tasmania ferry'),
  ('VIC', 'ACT', 880, 0, 2, 4, 'Melbourne to Canberra'),
  ('VIC', 'NT', 2640, 0, 7, 10, 'Melbourne to Darwin'),

  -- QLD routes
  ('QLD', 'NSW', 880, 0, 3, 5, 'Brisbane to Sydney corridor'),
  ('QLD', 'VIC', 1210, 0, 4, 6, 'Brisbane to Melbourne'),
  ('QLD', 'QLD', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('QLD', 'SA', 1540, 0, 5, 8, 'Brisbane to Adelaide'),
  ('QLD', 'WA', 2860, 0, 8, 12, 'Brisbane to Perth'),
  ('QLD', 'TAS', 1650, 0, 5, 8, 'Brisbane to Hobart'),
  ('QLD', 'ACT', 990, 0, 3, 5, 'Brisbane to Canberra'),
  ('QLD', 'NT', 1980, 0, 5, 8, 'Brisbane to Darwin'),

  -- SA routes
  ('SA', 'NSW', 1100, 0, 4, 6, 'Adelaide to Sydney'),
  ('SA', 'VIC', 770, 0, 2, 4, 'Adelaide to Melbourne'),
  ('SA', 'QLD', 1540, 0, 5, 8, 'Adelaide to Brisbane'),
  ('SA', 'SA', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('SA', 'WA', 1650, 0, 4, 7, 'Adelaide to Perth via Nullarbor'),
  ('SA', 'TAS', 1210, 0, 4, 6, 'Adelaide to Hobart'),
  ('SA', 'ACT', 1210, 0, 4, 6, 'Adelaide to Canberra'),
  ('SA', 'NT', 1980, 0, 5, 8, 'Adelaide to Darwin'),

  -- WA routes
  ('WA', 'NSW', 2200, 0, 7, 10, 'Perth to Sydney'),
  ('WA', 'VIC', 2420, 0, 7, 10, 'Perth to Melbourne'),
  ('WA', 'QLD', 2860, 0, 8, 12, 'Perth to Brisbane'),
  ('WA', 'SA', 1650, 0, 4, 7, 'Perth to Adelaide via Nullarbor'),
  ('WA', 'WA', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('WA', 'TAS', 2860, 0, 8, 12, 'Perth to Hobart'),
  ('WA', 'ACT', 2310, 0, 7, 10, 'Perth to Canberra'),
  ('WA', 'NT', 2200, 0, 5, 8, 'Perth to Darwin'),

  -- TAS routes
  ('TAS', 'NSW', 1320, 0, 4, 6, 'Hobart to Sydney'),
  ('TAS', 'VIC', 880, 0, 3, 5, 'Hobart to Melbourne'),
  ('TAS', 'QLD', 1650, 0, 5, 8, 'Hobart to Brisbane'),
  ('TAS', 'SA', 1210, 0, 4, 6, 'Hobart to Adelaide'),
  ('TAS', 'WA', 2860, 0, 8, 12, 'Hobart to Perth'),
  ('TAS', 'TAS', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('TAS', 'ACT', 1430, 0, 4, 6, 'Hobart to Canberra'),
  ('TAS', 'NT', 2750, 0, 8, 12, 'Hobart to Darwin'),

  -- ACT routes
  ('ACT', 'NSW', 330, 0, 1, 2, 'Canberra to Sydney'),
  ('ACT', 'VIC', 880, 0, 2, 4, 'Canberra to Melbourne'),
  ('ACT', 'QLD', 990, 0, 3, 5, 'Canberra to Brisbane'),
  ('ACT', 'SA', 1210, 0, 4, 6, 'Canberra to Adelaide'),
  ('ACT', 'WA', 2310, 0, 7, 10, 'Canberra to Perth'),
  ('ACT', 'TAS', 1430, 0, 4, 6, 'Canberra to Hobart'),
  ('ACT', 'ACT', 0, 0, 0, 0, 'Same state - no transport needed'),
  ('ACT', 'NT', 2530, 0, 6, 9, 'Canberra to Darwin'),

  -- NT routes
  ('NT', 'NSW', 2420, 0, 6, 9, 'Darwin to Sydney'),
  ('NT', 'VIC', 2640, 0, 7, 10, 'Darwin to Melbourne'),
  ('NT', 'QLD', 1980, 0, 5, 8, 'Darwin to Brisbane'),
  ('NT', 'SA', 1980, 0, 5, 8, 'Darwin to Adelaide'),
  ('NT', 'WA', 2200, 0, 5, 8, 'Darwin to Perth'),
  ('NT', 'TAS', 2750, 0, 8, 12, 'Darwin to Hobart'),
  ('NT', 'ACT', 2530, 0, 6, 9, 'Darwin to Canberra'),
  ('NT', 'NT', 0, 0, 0, 0, 'Same state - no transport needed')

ON CONFLICT (from_state, to_state) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  per_km_rate = EXCLUDED.per_km_rate,
  estimated_days_min = EXCLUDED.estimated_days_min,
  estimated_days_max = EXCLUDED.estimated_days_max,
  notes = EXCLUDED.notes,
  last_updated = NOW();

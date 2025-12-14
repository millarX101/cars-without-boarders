-- Seed transport route data
-- Based on Australian car transport industry averages (2025)

INSERT INTO public.transport_routes (from_state, to_state, base_price, per_km_rate, estimated_days_min, estimated_days_max, notes)
VALUES
  -- NSW routes
  ('NSW', 'VIC', 400, 0.45, 2, 4, 'Sydney to Melbourne corridor'),
  ('NSW', 'QLD', 500, 0.42, 3, 5, 'Sydney to Brisbane corridor'),
  ('NSW', 'SA', 650, 0.45, 4, 6, 'Sydney to Adelaide'),
  ('NSW', 'WA', 1000, 0.35, 7, 10, 'Cross-country to Perth'),
  ('NSW', 'TAS', 850, 0.45, 4, 6, 'Includes Spirit of Tasmania ferry'),
  ('NSW', 'ACT', 200, 0.55, 1, 2, 'Sydney to Canberra'),
  ('NSW', 'NT', 1200, 0.38, 6, 9, 'Sydney to Darwin via inland route'),

  -- VIC routes
  ('VIC', 'NSW', 400, 0.45, 2, 4, 'Melbourne to Sydney corridor'),
  ('VIC', 'QLD', 600, 0.40, 4, 6, 'Melbourne to Brisbane'),
  ('VIC', 'SA', 400, 0.48, 2, 4, 'Melbourne to Adelaide'),
  ('VIC', 'WA', 1100, 0.35, 7, 10, 'Cross-country to Perth'),
  ('VIC', 'TAS', 700, 0.50, 3, 5, 'Includes Spirit of Tasmania ferry'),
  ('VIC', 'ACT', 450, 0.48, 2, 4, 'Melbourne to Canberra'),
  ('VIC', 'NT', 1300, 0.36, 7, 10, 'Melbourne to Darwin'),

  -- QLD routes
  ('QLD', 'NSW', 500, 0.42, 3, 5, 'Brisbane to Sydney corridor'),
  ('QLD', 'VIC', 600, 0.40, 4, 6, 'Brisbane to Melbourne'),
  ('QLD', 'SA', 900, 0.38, 5, 8, 'Brisbane to Adelaide'),
  ('QLD', 'WA', 1200, 0.32, 8, 12, 'Brisbane to Perth'),
  ('QLD', 'TAS', 1000, 0.42, 5, 8, 'Brisbane to Hobart'),
  ('QLD', 'ACT', 600, 0.44, 3, 5, 'Brisbane to Canberra'),
  ('QLD', 'NT', 1100, 0.38, 5, 8, 'Brisbane to Darwin'),

  -- SA routes
  ('SA', 'NSW', 650, 0.45, 4, 6, 'Adelaide to Sydney'),
  ('SA', 'VIC', 400, 0.48, 2, 4, 'Adelaide to Melbourne'),
  ('SA', 'QLD', 900, 0.38, 5, 8, 'Adelaide to Brisbane'),
  ('SA', 'WA', 900, 0.38, 4, 7, 'Adelaide to Perth via Nullarbor'),
  ('SA', 'TAS', 800, 0.46, 4, 6, 'Adelaide to Hobart'),
  ('SA', 'ACT', 700, 0.46, 4, 6, 'Adelaide to Canberra'),
  ('SA', 'NT', 1000, 0.40, 5, 8, 'Adelaide to Darwin via Stuart Highway'),

  -- WA routes
  ('WA', 'NSW', 1000, 0.35, 7, 10, 'Perth to Sydney'),
  ('WA', 'VIC', 1100, 0.35, 7, 10, 'Perth to Melbourne'),
  ('WA', 'QLD', 1200, 0.32, 8, 12, 'Perth to Brisbane'),
  ('WA', 'SA', 900, 0.38, 4, 7, 'Perth to Adelaide via Nullarbor'),
  ('WA', 'TAS', 1300, 0.34, 8, 12, 'Perth to Hobart'),
  ('WA', 'ACT', 1100, 0.36, 7, 10, 'Perth to Canberra'),
  ('WA', 'NT', 1100, 0.36, 5, 8, 'Perth to Darwin'),

  -- TAS routes
  ('TAS', 'NSW', 850, 0.45, 4, 6, 'Hobart to Sydney'),
  ('TAS', 'VIC', 700, 0.50, 3, 5, 'Hobart to Melbourne'),
  ('TAS', 'QLD', 1000, 0.42, 5, 8, 'Hobart to Brisbane'),
  ('TAS', 'SA', 800, 0.46, 4, 6, 'Hobart to Adelaide'),
  ('TAS', 'WA', 1300, 0.34, 8, 12, 'Hobart to Perth'),
  ('TAS', 'ACT', 900, 0.44, 4, 6, 'Hobart to Canberra'),
  ('TAS', 'NT', 1400, 0.35, 8, 12, 'Hobart to Darwin'),

  -- ACT routes
  ('ACT', 'NSW', 200, 0.55, 1, 2, 'Canberra to Sydney'),
  ('ACT', 'VIC', 450, 0.48, 2, 4, 'Canberra to Melbourne'),
  ('ACT', 'QLD', 600, 0.44, 3, 5, 'Canberra to Brisbane'),
  ('ACT', 'SA', 700, 0.46, 4, 6, 'Canberra to Adelaide'),
  ('ACT', 'WA', 1100, 0.36, 7, 10, 'Canberra to Perth'),
  ('ACT', 'TAS', 900, 0.44, 4, 6, 'Canberra to Hobart'),
  ('ACT', 'NT', 1200, 0.38, 6, 9, 'Canberra to Darwin'),

  -- NT routes
  ('NT', 'NSW', 1200, 0.38, 6, 9, 'Darwin to Sydney'),
  ('NT', 'VIC', 1300, 0.36, 7, 10, 'Darwin to Melbourne'),
  ('NT', 'QLD', 1100, 0.38, 5, 8, 'Darwin to Brisbane'),
  ('NT', 'SA', 1000, 0.40, 5, 8, 'Darwin to Adelaide'),
  ('NT', 'WA', 1100, 0.36, 5, 8, 'Darwin to Perth'),
  ('NT', 'TAS', 1400, 0.35, 8, 12, 'Darwin to Hobart'),
  ('NT', 'ACT', 1200, 0.38, 6, 9, 'Darwin to Canberra')

ON CONFLICT (from_state, to_state) DO UPDATE SET
  base_price = EXCLUDED.base_price,
  per_km_rate = EXCLUDED.per_km_rate,
  estimated_days_min = EXCLUDED.estimated_days_min,
  estimated_days_max = EXCLUDED.estimated_days_max,
  notes = EXCLUDED.notes,
  last_updated = NOW();

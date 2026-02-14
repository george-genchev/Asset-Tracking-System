-- Migration: 004_seed_sample_data
-- Description: Seed database with 3 users, 4 strategies each, 10 assets per strategy
-- Date: 2026-02-15
-- Total: 3 users, 12 strategies, 120 assets

-- =============================================
-- 1. Create sample users in auth.users
-- =============================================

-- User 1: Alice Johnson (admin)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'alice@example.com',
  '$2a$10$rU8N9Dz9Ql3K3X4Y5Z6W7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E',
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Alice Johnson"}', false, '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- User 2: Bob Smith (regular user)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'bob@example.com',
  '$2a$10$rU8N9Dz9Ql3K3X4Y5Z6W7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E',
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Bob Smith"}', false, '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- User 3: Carol Davis (regular user)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'carol@example.com',
  '$2a$10$rU8N9Dz9Ql3K3X4Y5Z6W7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E',
  NOW(), NOW(), NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Carol Davis"}', false, '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. Create user_roles
-- =============================================

INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'user')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 3. Create strategies (4 per user = 12 total)
-- =============================================

INSERT INTO public.strategies (id, title, description, owner_id) VALUES
  -- Alice's 4 strategies
  ('a1111111-1111-1111-1111-111111111111', 'Tech Growth Portfolio', 'High-growth technology stocks for long-term appreciation', '11111111-1111-1111-1111-111111111111'),
  ('a2222222-2222-2222-2222-222222222222', 'Dividend Aristocrats', 'Blue-chip stocks with consistent dividend growth', '11111111-1111-1111-1111-111111111111'),
  ('a3333333-3333-3333-3333-333333333333', 'International Diversification', 'Global exposure across emerging and developed markets', '11111111-1111-1111-1111-111111111111'),
  ('a4444444-4444-4444-4444-444444444444', 'Value & Recovery Plays', 'Undervalued stocks with turnaround potential', '11111111-1111-1111-1111-111111111111'),
  
  -- Bob's 4 strategies
  ('b1111111-1111-1111-1111-111111111111', 'Core Index Holdings', 'Low-cost broad market index funds', '22222222-2222-2222-2222-222222222222'),
  ('b2222222-2222-2222-2222-222222222222', 'Sector Rotation Strategy', 'Tactical sector allocation based on market cycles', '22222222-2222-2222-2222-222222222222'),
  ('b3333333-3333-3333-3333-333333333333', 'ESG & Sustainable Investing', 'Environmentally and socially responsible companies', '22222222-2222-2222-2222-222222222222'),
  ('b4444444-4444-4444-4444-444444444444', 'Small Cap Growth', 'Small-cap stocks with high growth potential', '22222222-2222-2222-2222-222222222222'),
  
  -- Carol's 4 strategies
  ('c1111111-1111-1111-1111-111111111111', 'Retirement Income', '60/40 portfolio with bonds and dividend stocks', '33333333-3333-3333-3333-333333333333'),
  ('c2222222-2222-2222-2222-222222222222', 'Real Estate & Infrastructure', 'REITs and infrastructure funds for stable income', '33333333-3333-3333-3333-333333333333'),
  ('c3333333-3333-3333-3333-333333333333', 'Healthcare & Biotech', 'Defensive healthcare stocks and biotech opportunities', '33333333-3333-3333-3333-333333333333'),
  ('c4444444-4444-4444-4444-444444444444', 'Emerging Markets', 'Growth exposure to Asia, Latin America, and Africa', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 4. Create assets (10 per strategy = 120 total)
-- =============================================

DO $$
DECLARE
  target_open UUID;
  target_close UUID;
  target_rebalance UUID;
  order_market UUID;
  order_market_opg UUID;
BEGIN
  -- Get reference IDs
  SELECT id INTO target_open FROM public.targets WHERE name = 'Open Position';
  SELECT id INTO target_close FROM public.targets WHERE name = 'Close Position';
  SELECT id INTO target_rebalance FROM public.targets WHERE name = 'Rebalancing';
  SELECT id INTO order_market FROM public.orders WHERE name = 'Market';
  SELECT id INTO order_market_opg FROM public.orders WHERE name = 'Market (OPG)';

  -- ==================== ALICE'S STRATEGIES ====================
  
  -- Strategy 1: Tech Growth Portfolio (a1111111)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'AAPL', 'Apple Inc.', 'NASDAQ', '2024-01-15', 250, order_market, target_open, 'BUY'),
    ('a1111111-1111-1111-1111-111111111111', 'MSFT', 'Microsoft Corporation', 'NASDAQ', '2024-02-01', 200, order_market, target_open, 'BUY'),
    ('a1111111-1111-1111-1111-111111111111', 'GOOGL', 'Alphabet Inc.', 'NASDAQ', '2024-03-10', 150, order_market_opg, target_open, 'BUY'),
    ('a1111111-1111-1111-1111-111111111111', 'NVDA', 'NVIDIA Corporation', 'NASDAQ', '2024-04-05', 180, order_market, target_rebalance, 'HOLD'),
    ('a1111111-1111-1111-1111-111111111111', 'META', 'Meta Platforms Inc.', 'NASDAQ', '2024-05-12', 120, order_market, target_open, 'BUY'),
    ('a1111111-1111-1111-1111-111111111111', 'TSLA', 'Tesla Inc.', 'NASDAQ', '2024-06-20', 100, order_market_opg, target_rebalance, 'HOLD'),
    ('a1111111-1111-1111-1111-111111111111', 'AMD', 'Advanced Micro Devices', 'NASDAQ', '2024-07-15', 300, order_market, target_open, 'BUY'),
    ('a1111111-1111-1111-1111-111111111111', 'ADBE', 'Adobe Inc.', 'NASDAQ', '2024-08-08', 90, order_market, target_open, 'BUY'),
    ('a1111111-1111-1111-1111-111111111111', 'CRM', 'Salesforce Inc.', 'NYSE', '2024-09-22', 140, order_market, target_rebalance, 'HOLD'),
    ('a1111111-1111-1111-1111-111111111111', 'NFLX', 'Netflix Inc.', 'NASDAQ', '2024-10-30', 75, order_market_opg, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 2: Dividend Aristocrats (a2222222)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('a2222222-2222-2222-2222-222222222222', 'JNJ', 'Johnson & Johnson', 'NYSE', '2024-01-10', 300, order_market, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'PG', 'Procter & Gamble', 'NYSE', '2024-02-14', 280, order_market, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'KO', 'The Coca-Cola Company', 'NYSE', '2024-03-20', 400, order_market_opg, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'PEP', 'PepsiCo Inc.', 'NASDAQ', '2024-04-12', 250, order_market, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'MCD', 'McDonald\'s Corporation', 'NYSE', '2024-05-08', 150, order_market, target_rebalance, 'HOLD'),
    ('a2222222-2222-2222-2222-222222222222', 'WMT', 'Walmart Inc.', 'NYSE', '2024-06-15', 200, order_market, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'TGT', 'Target Corporation', 'NYSE', '2024-07-22', 180, order_market_opg, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'XOM', 'Exxon Mobil Corporation', 'NYSE', '2024-08-30', 350, order_market, target_rebalance, 'HOLD'),
    ('a2222222-2222-2222-2222-222222222222', 'CVX', 'Chevron Corporation', 'NYSE', '2024-09-10', 270, order_market, target_open, 'BUY'),
    ('a2222222-2222-2222-2222-222222222222', 'ABT', 'Abbott Laboratories', 'NYSE', '2024-10-18', 220, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 3: International Diversification (a3333333)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('a3333333-3333-3333-3333-333333333333', 'VXUS', 'Vanguard Total International Stock ETF', 'NYSE', '2024-01-08', 800, order_market, target_open, 'BUY'),
    ('a3333333-3333-3333-3333-333333333333', 'EFA', 'iShares MSCI EAFE ETF', 'NYSE', '2024-02-12', 600, order_market, target_open, 'BUY'),
    ('a3333333-3333-3333-3333-333333333333', 'VWO', 'Vanguard FTSE Emerging Markets ETF', 'NYSE', '2024-03-18', 900, order_market_opg, target_rebalance, 'HOLD'),
    ('a3333333-3333-3333-3333-333333333333', 'IEMG', 'iShares Core MSCI Emerging Markets ETF', 'NYSE', '2024-04-22', 700, order_market, target_open, 'BUY'),
    ('a3333333-3333-3333-3333-333333333333', 'EWJ', 'iShares MSCI Japan ETF', 'NYSE', '2024-05-30', 500, order_market, target_open, 'BUY'),
    ('a3333333-3333-3333-3333-333333333333', 'EWG', 'iShares MSCI Germany ETF', 'NYSE', '2024-06-14', 450, order_market, target_rebalance, 'HOLD'),
    ('a3333333-3333-3333-3333-333333333333', 'EWU', 'iShares MSCI United Kingdom ETF', 'NYSE', '2024-07-08', 480, order_market_opg, target_open, 'BUY'),
    ('a3333333-3333-3333-3333-333333333333', 'MCHI', 'iShares MSCI China ETF', 'NYSE', '2024-08-16', 550, order_market, target_close, 'SELL'),
    ('a3333333-3333-3333-3333-333333333333', 'EWZ', 'iShares MSCI Brazil ETF', 'NYSE', '2024-09-24', 420, order_market, target_open, 'BUY'),
    ('a3333333-3333-3333-3333-333333333333', 'INDA', 'iShares MSCI India ETF', 'NYSE', '2024-10-12', 650, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 4: Value & Recovery Plays (a4444444)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('a4444444-4444-4444-4444-444444444444', 'BAC', 'Bank of America Corporation', 'NYSE', '2024-01-22', 600, order_market, target_open, 'BUY'),
    ('a4444444-4444-4444-4444-444444444444', 'JPM', 'JPMorgan Chase & Co.', 'NYSE', '2024-02-28', 400, order_market, target_open, 'BUY'),
    ('a4444444-4444-4444-4444-444444444444', 'WFC', 'Wells Fargo & Company', 'NYSE', '2024-03-15', 500, order_market_opg, target_rebalance, 'HOLD'),
    ('a4444444-4444-4444-4444-444444444444', 'C', 'Citigroup Inc.', 'NYSE', '2024-04-20', 550, order_market, target_open, 'BUY'),
    ('a4444444-4444-4444-4444-444444444444', 'F', 'Ford Motor Company', 'NYSE', '2024-05-25', 800, order_market, target_rebalance, 'HOLD'),
    ('a4444444-4444-4444-4444-444444444444', 'GM', 'General Motors Company', 'NYSE', '2024-06-30', 700, order_market, target_open, 'BUY'),
    ('a4444444-4444-4444-4444-444444444444', 'PFE', 'Pfizer Inc.', 'NYSE', '2024-07-18', 450, order_market_opg, target_close, 'SELL'),
    ('a4444444-4444-4444-4444-444444444444', 'INTC', 'Intel Corporation', 'NASDAQ', '2024-08-22', 650, order_market, target_rebalance, 'HOLD'),
    ('a4444444-4444-4444-4444-444444444444', 'T', 'AT&T Inc.', 'NYSE', '2024-09-12', 900, order_market, target_open, 'BUY'),
    ('a4444444-4444-4444-4444-444444444444', 'VZ', 'Verizon Communications Inc.', 'NYSE', '2024-10-08', 850, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- ==================== BOB'S STRATEGIES ====================
  
  -- Strategy 1: Core Index Holdings (b1111111)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'VTI', 'Vanguard Total Stock Market ETF', 'NYSE', '2024-01-05', 1200, order_market, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'VOO', 'Vanguard S&P 500 ETF', 'NYSE', '2024-02-10', 1000, order_market, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'VEA', 'Vanguard FTSE Developed Markets ETF', 'NYSE', '2024-03-15', 900, order_market_opg, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'BND', 'Vanguard Total Bond Market ETF', 'NYSE', '2024-04-20', 800, order_market, target_rebalance, 'HOLD'),
    ('b1111111-1111-1111-1111-111111111111', 'VIG', 'Vanguard Dividend Appreciation ETF', 'NYSE', '2024-05-12', 700, order_market, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'SCHD', 'Schwab U.S. Dividend Equity ETF', 'NYSE', '2024-06-18', 650, order_market, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'VUG', 'Vanguard Growth ETF', 'NYSE', '2024-07-22', 600, order_market_opg, target_rebalance, 'HOLD'),
    ('b1111111-1111-1111-1111-111111111111', 'VTV', 'Vanguard Value ETF', 'NYSE', '2024-08-28', 580, order_market, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'VYM', 'Vanguard High Dividend Yield ETF', 'NYSE', '2024-09-14', 720, order_market, target_open, 'BUY'),
    ('b1111111-1111-1111-1111-111111111111', 'QQQ', 'Invesco QQQ Trust', 'NASDAQ', '2024-10-20', 500, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 2: Sector Rotation Strategy (b2222222)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('b2222222-2222-2222-2222-222222222222', 'XLF', 'Financial Select Sector SPDR Fund', 'NYSE', '2024-01-12', 600, order_market, target_open, 'BUY'),
    ('b2222222-2222-2222-2222-222222222222', 'XLK', 'Technology Select Sector SPDR Fund', 'NYSE', '2024-02-16', 700, order_market, target_rebalance, 'HOLD'),
    ('b2222222-2222-2222-2222-222222222222', 'XLE', 'Energy Select Sector SPDR Fund', 'NYSE', '2024-03-22', 500, order_market_opg, target_close, 'SELL'),
    ('b2222222-2222-2222-2222-222222222222', 'XLV', 'Health Care Select Sector SPDR Fund', 'NYSE', '2024-04-18', 650, order_market, target_open, 'BUY'),
    ('b2222222-2222-2222-2222-222222222222', 'XLI', 'Industrial Select Sector SPDR Fund', 'NYSE', '2024-05-24', 550, order_market, target_open, 'BUY'),
    ('b2222222-2222-2222-2222-222222222222', 'XLY', 'Consumer Discretionary Select Sector SPDR', 'NYSE', '2024-06-28', 480, order_market, target_rebalance, 'HOLD'),
    ('b2222222-2222-2222-2222-222222222222', 'XLP', 'Consumer Staples Select Sector SPDR Fund', 'NYSE', '2024-07-14', 520, order_market_opg, target_open, 'BUY'),
    ('b2222222-2222-2222-2222-222222222222', 'XLRE', 'Real Estate Select Sector SPDR Fund', 'NYSE', '2024-08-20', 450, order_market, target_open, 'BUY'),
    ('b2222222-2222-2222-2222-222222222222', 'XLU', 'Utilities Select Sector SPDR Fund', 'NYSE', '2024-09-26', 580, order_market, target_rebalance, 'HOLD'),
    ('b2222222-2222-2222-2222-222222222222', 'XLB', 'Materials Select Sector SPDR Fund', 'NYSE', '2024-10-16', 420, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 3: ESG & Sustainable Investing (b3333333)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('b3333333-3333-3333-3333-333333333333', 'ESGV', 'Vanguard ESG U.S. Stock ETF', 'NYSE', '2024-01-16', 700, order_market, target_open, 'BUY'),
    ('b3333333-3333-3333-3333-333333333333', 'ESGU', 'iShares MSCI USA ESG Select ETF', 'NYSE', '2024-02-20', 650, order_market, target_open, 'BUY'),
    ('b3333333-3333-3333-3333-333333333333', 'VSGX', 'Vanguard ESG International Stock ETF', 'NYSE', '2024-03-26', 600, order_market_opg, target_rebalance, 'HOLD'),
    ('b3333333-3333-3333-3333-333333333333', 'VCEB', 'Vanguard ESG U.S. Corporate Bond ETF', 'NYSE', '2024-04-30', 550, order_market, target_open, 'BUY'),
    ('b3333333-3333-3333-3333-333333333333', 'SUSL', 'iShares ESG MSCI USA Leaders ETF', 'NYSE', '2024-05-14', 580, order_market, target_open, 'BUY'),
    ('b3333333-3333-3333-3333-333333333333', 'ICLN', 'iShares Global Clean Energy ETF', 'NASDAQ', '2024-06-20', 800, order_market, target_rebalance, 'HOLD'),
    ('b3333333-3333-3333-3333-333333333333', 'PBW', 'Invesco WilderHill Clean Energy ETF', 'NYSE', '2024-07-24', 450, order_market_opg, target_close, 'SELL'),
    ('b3333333-3333-3333-3333-333333333333', 'CRBN', 'iShares MSCI ACWI Low Carbon Target ETF', 'NYSE', '2024-08-18', 620, order_market, target_open, 'BUY'),
    ('b3333333-3333-3333-3333-333333333333', 'DSI', 'iShares MSCI KLD 400 Social ETF', 'NYSE', '2024-09-22', 540, order_market, target_open, 'BUY'),
    ('b3333333-3333-3333-3333-333333333333', 'ESGD', 'iShares MSCI EAFE ESG Optimized ETF', 'NASDAQ', '2024-10-28', 590, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 4: Small Cap Growth (b4444444)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('b4444444-4444-4444-4444-444444444444', 'VB', 'Vanguard Small-Cap ETF', 'NYSE', '2024-01-24', 500, order_market, target_open, 'BUY'),
    ('b4444444-4444-4444-4444-444444444444', 'IJR', 'iShares Core S&P Small-Cap ETF', 'NYSE', '2024-02-28', 480, order_market, target_open, 'BUY'),
    ('b4444444-4444-4444-4444-444444444444', 'VBK', 'Vanguard Small-Cap Growth ETF', 'NYSE', '2024-03-14', 550, order_market_opg, target_rebalance, 'HOLD'),
    ('b4444444-4444-4444-4444-444444444444', 'IWM', 'iShares Russell 2000 ETF', 'NYSE', '2024-04-18', 600, order_market, target_open, 'BUY'),
    ('b4444444-4444-4444-4444-444444444444', 'SCHA', 'Schwab U.S. Small-Cap ETF', 'NYSE', '2024-05-22', 520, order_market, target_open, 'BUY'),
    ('b4444444-4444-4444-4444-444444444444', 'VTWO', 'Vanguard Russell 2000 ETF', 'NASDAQ', '2024-06-26', 490, order_market, target_rebalance, 'HOLD'),
    ('b4444444-4444-4444-4444-444444444444', 'SLYG', 'SPDR S&P 600 Small Cap Growth ETF', 'NYSE', '2024-07-30', 460, order_market_opg, target_open, 'BUY'),
    ('b4444444-4444-4444-4444-444444444444', 'IJT', 'iShares S&P Small-Cap 600 Growth ETF', 'NYSE', '2024-08-24', 440, order_market, target_close, 'SELL'),
    ('b4444444-4444-4444-4444-444444444444', 'VIOO', 'Vanguard S&P Small-Cap 600 ETF', 'NYSE', '2024-09-18', 510, order_market, target_open, 'BUY'),
    ('b4444444-4444-4444-4444-444444444444', 'PSCT', 'Invesco S&P SmallCap Technology ETF', 'NASDAQ', '2024-10-22', 420, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- ==================== CAROL'S STRATEGIES ====================
  
  -- Strategy 1: Retirement Income (c1111111)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'BND', 'Vanguard Total Bond Market ETF', 'NYSE', '2024-01-18', 1000, order_market, target_open, 'BUY'),
    ('c1111111-1111-1111-1111-111111111111', 'AGG', 'iShares Core U.S. Aggregate Bond ETF', 'NYSE', '2024-02-22', 950, order_market, target_open, 'BUY'),
    ('c1111111-1111-1111-1111-111111111111', 'LQD', 'iShares iBoxx Investment Grade Corporate Bond', 'NYSE', '2024-03-28', 800, order_market_opg, target_rebalance, 'HOLD'),
    ('c1111111-1111-1111-1111-111111111111', 'TLT', 'iShares 20+ Year Treasury Bond ETF', 'NASDAQ', '2024-04-14', 700, order_market, target_open, 'BUY'),
    ('c1111111-1111-1111-1111-111111111111', 'VYM', 'Vanguard High Dividend Yield ETF', 'NYSE', '2024-05-20', 600, order_market, target_open, 'BUY'),
    ('c1111111-1111-1111-1111-111111111111', 'SCHD', 'Schwab U.S. Dividend Equity ETF', 'NYSE', '2024-06-24', 580, order_market, target_rebalance, 'HOLD'),
    ('c1111111-1111-1111-1111-111111111111', 'DVY', 'iShares Select Dividend ETF', 'NASDAQ', '2024-07-28', 520, order_market_opg, target_open, 'BUY'),
    ('c1111111-1111-1111-1111-111111111111', 'MUB', 'iShares National Muni Bond ETF', 'NYSE', '2024-08-12', 750, order_market, target_open, 'BUY'),
    ('c1111111-1111-1111-1111-111111111111', 'VCIT', 'Vanguard Intermediate-Term Corporate Bond ETF', 'NYSE', '2024-09-16', 680, order_market, target_rebalance, 'HOLD'),
    ('c1111111-1111-1111-1111-111111111111', 'VGIT', 'Vanguard Intermediate-Term Treasury ETF', 'NASDAQ', '2024-10-24', 720, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 2: Real Estate & Infrastructure (c2222222)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('c2222222-2222-2222-2222-222222222222', 'VNQ', 'Vanguard Real Estate ETF', 'NYSE', '2024-01-20', 600, order_market, target_open, 'BUY'),
    ('c2222222-2222-2222-2222-222222222222', 'XLRE', 'Real Estate Select Sector SPDR Fund', 'NYSE', '2024-02-24', 580, order_market, target_open, 'BUY'),
    ('c2222222-2222-2222-2222-222222222222', 'IYR', 'iShares U.S. Real Estate ETF', 'NYSE', '2024-03-30', 550, order_market_opg, target_rebalance, 'HOLD'),
    ('c2222222-2222-2222-2222-222222222222', 'SCHH', 'Schwab U.S. REIT ETF', 'NYSE', '2024-04-26', 520, order_market, target_open, 'BUY'),
    ('c2222222-2222-2222-2222-222222222222', 'IGF', 'iShares Global Infrastructure ETF', 'NASDAQ', '2024-05-16', 480, order_market, target_open, 'BUY'),
    ('c2222222-2222-2222-2222-222222222222', 'IFRA', 'iShares U.S. Infrastructure ETF', 'NYSE', '2024-06-22', 450, order_market, target_rebalance, 'HOLD'),
    ('c2222222-2222-2222-2222-222222222222', 'PAVE', 'Global X U.S. Infrastructure Development ETF', 'NYSE', '2024-07-26', 500, order_market_opg, target_open, 'BUY'),
    ('c2222222-2222-2222-2222-222222222222', 'USRT', 'iShares Core U.S. REIT ETF', 'NYSE', '2024-08-14', 530, order_market, target_close, 'SELL'),
    ('c2222222-2222-2222-2222-222222222222', 'FREL', 'Fidelity MSCI Real Estate Index ETF', 'NYSE', '2024-09-20', 490, order_market, target_open, 'BUY'),
    ('c2222222-2222-2222-2222-222222222222', 'REET', 'iShares Global REIT ETF', 'NASDAQ', '2024-10-26', 540, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 3: Healthcare & Biotech (c3333333)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('c3333333-3333-3333-3333-333333333333', 'XLV', 'Health Care Select Sector SPDR Fund', 'NYSE', '2024-01-26', 700, order_market, target_open, 'BUY'),
    ('c3333333-3333-3333-3333-333333333333', 'VHT', 'Vanguard Health Care ETF', 'NYSE', '2024-02-18', 650, order_market, target_open, 'BUY'),
    ('c3333333-3333-3333-3333-333333333333', 'IBB', 'iShares Biotechnology ETF', 'NASDAQ', '2024-03-24', 500, order_market_opg, target_rebalance, 'HOLD'),
    ('c3333333-3333-3333-3333-333333333333', 'IHI', 'iShares U.S. Medical Devices ETF', 'NYSE', '2024-04-28', 580, order_market, target_open, 'BUY'),
    ('c3333333-3333-3333-3333-333333333333', 'IHF', 'iShares U.S. Healthcare Providers ETF', 'NYSE', '2024-05-22', 550, order_market, target_open, 'BUY'),
    ('c3333333-3333-3333-3333-333333333333', 'XBI', 'SPDR S&P Biotech ETF', 'NYSE', '2024-06-28', 450, order_market, target_rebalance, 'HOLD'),
    ('c3333333-3333-3333-3333-333333333333', 'ARKG', 'ARK Genomic Revolution ETF', 'NYSE', '2024-07-16', 400, order_market_opg, target_close, 'SELL'),
    ('c3333333-3333-3333-3333-333333333333', 'PJP', 'Invesco Dynamic Pharmaceuticals ETF', 'NYSE', '2024-08-20', 520, order_market, target_open, 'BUY'),
    ('c3333333-3333-3333-3333-333333333333', 'FHLC', 'Fidelity MSCI Health Care Index ETF', 'NYSE', '2024-09-24', 600, order_market, target_open, 'BUY'),
    ('c3333333-3333-3333-3333-333333333333', 'GNOM', 'Global X Genomics & Biotechnology ETF', 'NASDAQ', '2024-10-30', 480, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

  -- Strategy 4: Emerging Markets (c4444444)
  INSERT INTO public.assets (strategy_id, ticker, name, exchange, date, quantity, order_id, target_id, action) VALUES
    ('c4444444-4444-4444-4444-444444444444', 'VWO', 'Vanguard FTSE Emerging Markets ETF', 'NYSE', '2024-01-14', 900, order_market, target_open, 'BUY'),
    ('c4444444-4444-4444-4444-444444444444', 'IEMG', 'iShares Core MSCI Emerging Markets ETF', 'NYSE', '2024-02-20', 850, order_market, target_open, 'BUY'),
    ('c4444444-4444-4444-4444-444444444444', 'EEM', 'iShares MSCI Emerging Markets ETF', 'NYSE', '2024-03-26', 800, order_market_opg, target_rebalance, 'HOLD'),
    ('c4444444-4444-4444-4444-444444444444', 'INDA', 'iShares MSCI India ETF', 'NYSE', '2024-04-22', 700, order_market, target_open, 'BUY'),
    ('c4444444-4444-4444-4444-444444444444', 'MCHI', 'iShares MSCI China ETF', 'NYSE', '2024-05-28', 650, order_market, target_close, 'SELL'),
    ('c4444444-4444-4444-4444-444444444444', 'EWZ', 'iShares MSCI Brazil ETF', 'NYSE', '2024-06-16', 600, order_market, target_rebalance, 'HOLD'),
    ('c4444444-4444-4444-4444-444444444444', 'EZA', 'iShares MSCI South Africa ETF', 'NYSE', '2024-07-20', 550, order_market_opg, target_open, 'BUY'),
    ('c4444444-4444-4444-4444-444444444444', 'EEMV', 'iShares MSCI Emerging Markets Min Vol ETF', 'NYSE', '2024-08-26', 720, order_market, target_open, 'BUY'),
    ('c4444444-4444-4444-4444-444444444444', 'EMQQ', 'Emerging Markets Internet & Ecommerce ETF', 'NASDAQ', '2024-09-30', 480, order_market, target_rebalance, 'HOLD'),
    ('c4444444-4444-4444-4444-444444444444', 'DGRE', 'WisdomTree Emerging Markets Quality Div Growth', 'NYSE', '2024-10-14', 640, order_market, target_open, 'BUY')
  ON CONFLICT DO NOTHING;

END $$;

-- =============================================
-- End of seed migration
-- =============================================

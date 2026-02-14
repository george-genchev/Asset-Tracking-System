# Seed Data Summary

**Migration Applied:** 004_seed_sample_data  
**Date:** 2026-02-15  
**Status:** ✅ Successfully Applied

## Database Population

### Users (3 total)

| User ID | Email | Name | Role |
|---------|-------|------|------|
| `11111111-1111-1111-1111-111111111111` | alice@example.com | Alice Johnson | admin |
| `22222222-2222-2222-2222-222222222222` | bob@example.com | Bob Smith | user |
| `33333333-3333-3333-3333-333333333333` | carol@example.com | Carol Davis | user |

**Password (same for all users):** The encrypted password hash in the database corresponds to a test password for development use.

### Strategies (12 total - 4 per user)

#### Alice's Strategies
1. **Tech Growth Portfolio** - High-growth technology stocks for long-term appreciation
   - Assets: AAPL, MSFT, GOOGL, NVDA, META, TSLA, AMD, ADBE, CRM, NFLX
   
2. **Dividend Aristocrats** - Blue-chip stocks with consistent dividend growth
   - Assets: JNJ, PG, KO, PEP, MCD, WMT, TGT, XOM, CVX, ABT
   
3. **International Diversification** - Global exposure across emerging and developed markets
   - Assets: VXUS, EFA, VWO, IEMG, EWJ, EWG, EWU, MCHI, EWZ, INDA
   
4. **Value & Recovery Plays** - Undervalued stocks with turnaround potential
   - Assets: BAC, JPM, WFC, C, F, GM, PFE, INTC, T, VZ

#### Bob's Strategies
1. **Core Index Holdings** - Low-cost broad market index funds
   - Assets: VTI, VOO, VEA, BND, VIG, SCHD, VUG, VTV, VYM, QQQ
   
2. **Sector Rotation Strategy** - Tactical sector allocation based on market cycles
   - Assets: XLF, XLK, XLE, XLV, XLI, XLY, XLP, XLRE, XLU, XLB
   
3. **ESG & Sustainable Investing** - Environmentally and socially responsible companies
   - Assets: ESGV, ESGU, VSGX, VCEB, SUSL, ICLN, PBW, CRBN, DSI, ESGD
   
4. **Small Cap Growth** - Small-cap stocks with high growth potential
   - Assets: VB, IJR, VBK, IWM, SCHA, VTWO, SLYG, IJT, VIOO, PSCT

#### Carol's Strategies
1. **Retirement Income** - 60/40 portfolio with bonds and dividend stocks
   - Assets: BND, AGG, LQD, TLT, VYM, SCHD, DVY, MUB, VCIT, VGIT
   
2. **Real Estate & Infrastructure** - REITs and infrastructure funds for stable income
   - Assets: VNQ, XLRE, IYR, SCHH, IGF, IFRA, PAVE, USRT, FREL, REET
   
3. **Healthcare & Biotech** - Defensive healthcare stocks and biotech opportunities
   - Assets: XLV, VHT, IBB, IHI, IHF, XBI, ARKG, PJP, FHLC, GNOM
   
4. **Emerging Markets** - Growth exposure to Asia, Latin America, and Africa
   - Assets: VWO, IEMG, EEM, INDA, MCHI, EWZ, EZA, EEMV, EMQQ, DGRE

### Assets (120 total - 10 per strategy)

Each asset includes:
- Ticker symbol
- Full company/fund name
- Exchange (NASDAQ/NYSE)
- Purchase date (2024)
- Quantity (shares)
- Order type (Market or Market OPG)
- Target (Open Position, Close Position, Rebalancing)
- Action (BUY, SELL, HOLD)

## Reference Data

### Targets (3)
- **Open Position** - New investment position
- **Close Position** - Exit from investment
- **Rebalancing** - Portfolio rebalancing action

### Orders (2)
- **Market** - Standard market order
- **Market (OPG)** - Market order at opening bell

## Verification Queries

```sql
-- Count all seeded data
SELECT 
  (SELECT COUNT(*) FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')) as users,
  (SELECT COUNT(*) FROM public.user_roles) as roles,
  (SELECT COUNT(*) FROM public.strategies) as strategies,
  (SELECT COUNT(*) FROM public.assets) as assets;

-- Expected result: users=3, roles=3, strategies=12, assets=120
```

```sql
-- View Alice's portfolio
SELECT 
  s.title,
  COUNT(a.id) as asset_count,
  STRING_AGG(a.ticker, ', ' ORDER BY a.ticker) as tickers
FROM public.strategies s
LEFT JOIN public.assets a ON s.id = a.strategy_id
WHERE s.owner_id = '11111111-1111-1111-1111-111111111111'
GROUP BY s.title
ORDER BY s.title;
```

## RLS Policy Testing

All strategies and assets are protected by Row Level Security policies:
- Users can only see their own strategies
- Users can only see assets belonging to their strategies
- Admin users have full access

To test RLS, authenticate as different users and query the tables:
```sql
-- As Alice (admin) - should see all 12 strategies
SELECT COUNT(*) FROM public.strategies;

-- As Bob or Carol (users) - should see only their 4 strategies
SELECT COUNT(*) FROM public.strategies WHERE owner_id = auth.uid();
```

## Next Steps

1. **Authentication Implementation** - Connect frontend to Supabase Auth
2. **Dashboard Development** - Display strategies and assets for logged-in users
3. **CRUD Operations** - Implement create, read, update, delete for strategies/assets
4. **Data Visualization** - Add charts for portfolio allocation and performance
5. **Testing** - Verify RLS policies work correctly with different user roles

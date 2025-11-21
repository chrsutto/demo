# Data Sources & API Reference Guide

Complete reference for all data sources used in the Stablecoin Yield Aggregator.

## 🌐 Live API Sources (No Authentication Required)

These APIs are publicly accessible and provide real-time data.

---

## 1. DeFi Llama Yields API

### Overview
- **Base URL:** `https://yields.llama.fi`
- **Documentation:** https://defillama.com/docs/api
- **Rate Limit:** No official limit, but respect their servers
- **Authentication:** None required
- **Update Frequency:** Hourly

### Primary Endpoint: Get All Pools

```http
GET https://yields.llama.fi/pools
```

**Response Structure:**
```json
{
  "status": "success",
  "data": [
    {
      "chain": "Ethereum",
      "project": "aave-v3",
      "symbol": "USDC",
      "tvlUsd": 586030000,
      "apyBase": 3.14,
      "apyReward": 3.0,
      "apy": 6.14,
      "rewardTokens": ["AAVE"],
      "pool": "0x...",
      "apyPct1D": 6.1,
      "apyPct7D": 6.2,
      "apyPct30D": 5.8,
      "stablecoin": true,
      "ilRisk": "no",
      "exposure": "single",
      "predictions": {
        "predictedClass": "stable",
        "predictedProbability": 0.95
      },
      "poolMeta": "Supply",
      "mu": 5.2,
      "sigma": 0.8,
      "count": 365,
      "outlier": false,
      "underlyingTokens": ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
      "url": "https://app.aave.com/reserve-overview/?underlyingAsset=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&marketName=proto_mainnet_v3"
    }
  ]
}
```

**Key Fields:**
- `apy`: Total APY including base + rewards
- `apyBase`: Base lending/LP APY
- `apyReward`: Additional reward APY from protocol tokens
- `tvlUsd`: Total Value Locked in USD
- `stablecoin`: Boolean indicating if it's a stablecoin pool
- `chain`: Blockchain network
- `project`: Protocol name

**Example Code:**
```javascript
async function fetchDefiLlamaStablecoinYields() {
  const response = await fetch('https://yields.llama.fi/pools');
  const data = await response.json();
  
  // Filter for stablecoins with >$1M TVL
  const stablecoins = data.data.filter(pool => 
    pool.stablecoin === true && 
    pool.tvlUsd > 1000000 &&
    pool.apy < 200 // Filter outliers
  );
  
  return stablecoins;
}
```

**Test It:**
```bash
curl https://yields.llama.fi/pools | jq '.data[] | select(.stablecoin == true) | {project, symbol, chain, apy, tvlUsd}'
```

---

## 2. Pendle Finance API

### Overview
- **Base URL:** `https://api-v2.pendle.finance`
- **Documentation:** https://docs.pendle.finance/Developers/Integration/HowToIntegratePendle
- **API Docs:** https://api-v2.pendle.finance/core/docs
- **Rate Limit:** Reasonable usage (no official limit)
- **Authentication:** None required
- **Update Frequency:** Every 15-30 minutes

### Get Markets by Chain

```http
GET https://api-v2.pendle.finance/core/v1/{chainId}/markets
```

**Chain IDs:**
- `1` - Ethereum Mainnet
- `42161` - Arbitrum
- `10` - Optimism
- `56` - BNB Chain
- `8453` - Base

**Response Structure:**
```json
{
  "results": [
    {
      "address": "0x...",
      "symbol": "PT-sUSDe-26SEP2024",
      "expiry": "2024-09-26T00:00:00.000Z",
      "pt": {
        "address": "0x...",
        "symbol": "PT-sUSDe-26SEP2024",
        "decimals": 18
      },
      "yt": {
        "address": "0x...",
        "symbol": "YT-sUSDe-26SEP2024",
        "decimals": 18
      },
      "sy": {
        "address": "0x...",
        "symbol": "SY-sUSDe",
        "decimals": 18
      },
      "underlyingAsset": {
        "address": "0x...",
        "symbol": "sUSDe",
        "decimals": 18
      },
      "chainId": 1,
      "totalActiveLiquidity": 420000000,
      "impliedApy": 0.1234,
      "ytFloatingApy": 0.0567,
      "underlyingApy": 0.05,
      "priceUSD": 1.001,
      "totalPt": "123456789000000000000000000",
      "totalSy": "123456789000000000000000000"
    }
  ],
  "total": 150,
  "limit": 100,
  "skip": 0
}
```

**Key Fields:**
- `impliedApy`: Market-implied APY for PT holders (this is what you earn)
- `ytFloatingApy`: Current APY for YT holders
- `totalActiveLiquidity`: TVL in USD
- `expiry`: Maturity date of the market
- `underlyingAsset`: The base asset (e.g., sUSDe, sDAI)

**Example Code:**
```javascript
async function fetchPendleYields(chainId = 1) {
  const response = await fetch(
    `https://api-v2.pendle.finance/core/v1/${chainId}/markets`
  );
  const data = await response.json();
  
  // Filter for stablecoin-related markets
  const stablecoinMarkets = data.results.filter(market => 
    market.underlyingAsset.symbol.includes('USD') &&
    market.totalActiveLiquidity > 1000000
  );
  
  return stablecoinMarkets.map(market => ({
    protocol: `Pendle ${market.symbol}`,
    stablecoin: market.underlyingAsset.symbol,
    apy: market.impliedApy * 100, // Convert to percentage
    tvl: market.totalActiveLiquidity,
    maturity: market.expiry
  }));
}
```

**Test It:**
```bash
# Get Ethereum markets
curl https://api-v2.pendle.finance/core/v1/1/markets | jq '.results[] | {symbol, impliedApy, totalActiveLiquidity}'

# Get Arbitrum markets
curl https://api-v2.pendle.finance/core/v1/42161/markets | jq '.results[0]'
```

### Additional Pendle Endpoints

**Get Single Market Details:**
```http
GET https://api-v2.pendle.finance/core/v1/{chainId}/markets/{marketAddress}
```

**Get Historical APY:**
```http
GET https://api-v2.pendle.finance/core/v1/{chainId}/markets/{marketAddress}/analytics
```

---

## 3. Merkl API

### Overview
- **Base URL:** `https://api.merkl.xyz`
- **Documentation:** https://docs.merkl.xyz/
- **NPM Package:** `@merkl/api`
- **Rate Limit:** Fair use policy
- **Authentication:** None required
- **Update Frequency:** Real-time

### Get Opportunities

```http
GET https://api.merkl.xyz/v3/opportunities
```

**Query Parameters:**
- `chainId` - Filter by chain (1, 8453, 42161, etc.)
- `type` - Filter by type (ERC4626, CONCENTRATED_LIQUIDITY, etc.)
- `tokenSymbol` - Filter by token (USDC, USDT, etc.)

**Response Structure:**
```json
{
  "data": [
    {
      "id": "0x...",
      "name": "Morpho USDC Vault",
      "type": "ERC4626",
      "chainId": 1,
      "chainName": "Ethereum",
      "protocol": "Morpho",
      "tokenAddress": "0x...",
      "tokenSymbol": "USDC",
      "tokenDecimals": 6,
      "apr": 9.8,
      "tvl": 145000000,
      "dailyRewards": 98520,
      "campaigns": [
        {
          "id": "campaign-1",
          "rewardToken": "MORPHO",
          "apr": 2.5,
          "startDate": "2024-01-01T00:00:00Z",
          "endDate": "2024-12-31T23:59:59Z"
        }
      ],
      "url": "https://app.morpho.org/"
    }
  ],
  "meta": {
    "total": 917,
    "page": 1,
    "pageSize": 50
  }
}
```

**Example Code:**
```javascript
async function fetchMerklYields(chainId = 1) {
  const response = await fetch(
    `https://api.merkl.xyz/v3/opportunities?chainId=${chainId}&type=ERC4626`
  );
  const data = await response.json();
  
  // Filter for stablecoins
  const stablecoinOpps = data.data.filter(opp => 
    ['USDC', 'USDT', 'DAI', 'USDS'].includes(opp.tokenSymbol) &&
    opp.tvl > 1000000
  );
  
  return stablecoinOpps;
}
```

**Test It:**
```bash
# Get all opportunities on Ethereum
curl "https://api.merkl.xyz/v3/opportunities?chainId=1" | jq '.data[0]'

# Get USDC opportunities
curl "https://api.merkl.xyz/v3/opportunities?tokenSymbol=USDC" | jq '.data[] | {name, apr, tvl}'
```

### Get User Rewards

```http
GET https://api.merkl.xyz/v3/users/{userAddress}/rewards
```

**Query Parameters:**
- `chainId` - Filter by chain

### Get Campaigns

```http
GET https://api.merkl.xyz/v3/campaigns
```

---

## 📊 Manual Data Sources (No Public API)

These protocols don't have public APIs, so data must be collected manually or via web scraping.

---

## 4. Midas Protocol

### Overview
- **Website:** https://midas.app/
- **Documentation:** https://docs.midas.app/
- **Data Source:** Manual updates from website
- **Update Frequency:** Daily

### Available Products

**mTBILL** (Treasury-backed)
```json
{
  "protocol": "Midas mTBILL",
  "stablecoin": "USDC",
  "chain": "Ethereum",
  "apy": 5.25,
  "tvl": 45000000,
  "type": "RWA",
  "backing": "BlackRock Treasury Bond",
  "contract": "0x...",
  "url": "https://midas.app/"
}
```

**mBASIS** (Basis Trade)
```json
{
  "protocol": "Midas mBASIS",
  "stablecoin": "USDC", 
  "chain": "Ethereum",
  "apy": 12.5,
  "tvl": 28000000,
  "type": "Basis Trade",
  "strategy": "Cash and carry arbitrage",
  "url": "https://midas.app/"
}
```

**mEDGE** (Delta Neutral)
```json
{
  "protocol": "Midas mEDGE",
  "stablecoin": "USDC",
  "chain": "Ethereum", 
  "apy": 8.5,
  "tvl": 12000000,
  "type": "Delta Neutral",
  "manager": "Edge Capital",
  "url": "https://midas.app/"
}
```

**Where to get data:**
- Visit https://midas.app/
- Check individual token pages
- Monitor their Twitter: @MidasRWA
- Track on DeFi Llama: https://defillama.com/protocol/midas

---

## 5. Gauntlet Vaults

### Overview
- **Website:** https://www.gauntlet.xyz/
- **App:** https://app.gauntlet.xyz/
- **Documentation:** https://docs.gauntlet.xyz/
- **Data Source:** Manual via DeFi Llama or protocol monitoring
- **Update Frequency:** Daily

### Key Products

**Gauntlet USD Alpha (gtUSDa)**
```json
{
  "protocol": "Gauntlet USD Alpha",
  "stablecoin": "USDC",
  "chain": "Multi-chain",
  "apy": 8.5,
  "tvl": 250000000,
  "type": "Risk-Managed",
  "vaultAddress": "0x...",
  "url": "https://www.gauntlet.xyz/gauntlet-strategies/gtusda"
}
```

**Where to get data:**
- Gauntlet App: https://app.gauntlet.xyz/
- DeFi Llama Protocol Page: https://defillama.com/protocol/gauntlet
- VaultBook: https://www.gauntlet.xyz/resources/introducing-the-gauntlet-vaultbook-demystifying-vault-curation
- Monitor Morpho vaults (many Gauntlet vaults are on Morpho)

---

## 6. Noon Capital

### Overview
- **Website:** https://noon.capital/
- **App:** https://app.noon.capital/
- **Documentation:** https://docs.noon.capital/
- **Data Source:** Website + blockchain data
- **Update Frequency:** Daily

### Products

**USN (Base stablecoin)**
```json
{
  "protocol": "Noon USN",
  "stablecoin": "USDC/USDT",
  "chain": "Ethereum",
  "apy": 14.5,
  "tvl": 33000000,
  "type": "Delta Neutral",
  "contract": "0x...",
  "url": "https://app.noon.capital/"
}
```

**sUSN (Staked)**
```json
{
  "protocol": "Noon sUSN",
  "stablecoin": "USN",
  "chain": "Ethereum",
  "apy": 17.5,
  "tvl": 28000000,
  "type": "Staked",
  "url": "https://app.noon.capital/"
}
```

**Where to get data:**
- Homepage displays current APY: https://noon.capital/
- Proof of Solvency dashboard
- Twitter: @noon_capital
- DeFi Llama: https://defillama.com/protocol/noon (if listed)

---

## 7. YieldFi

### Overview
- **Website:** https://yield.fi/
- **Documentation:** Limited public docs
- **Data Source:** Website dashboard
- **Update Frequency:** Daily

### Products

**yUSD**
```json
{
  "protocol": "YieldFi yUSD",
  "stablecoin": "USDC/USDT",
  "chain": "Multi-chain",
  "apy": 23.5,
  "tvl": 121000000,
  "type": "Multi-Strategy",
  "maxDrawdown": "< 1%",
  "url": "https://yield.fi/"
}
```

**Where to get data:**
- Dashboard: https://yield.fi/
- CoinGecko: https://www.coingecko.com/en/coins/yieldfi
- Twitter updates: @YieldFi (if exists)
- DeFi Llama: https://defillama.com/protocol/yieldfi

---

## 8. Avant Protocol

### Overview
- **Website:** https://www.avantprotocol.com/
- **Documentation:** https://docs.avantprotocol.com/
- **Chain:** Avalanche
- **Data Source:** Website
- **Update Frequency:** Daily

### Products

**avUSD**
```json
{
  "protocol": "Avant avUSD",
  "stablecoin": "USDC/USDT",
  "chain": "Avalanche",
  "apy": 15.8,
  "tvl": 89000000,
  "type": "Delta Neutral",
  "url": "https://www.avantprotocol.com/"
}
```

**savUSD (Staked)**
```json
{
  "protocol": "Avant savUSD",
  "stablecoin": "avUSD",
  "chain": "Avalanche",
  "apy": 18.2,
  "tvl": 67000000,
  "type": "Staked",
  "url": "https://www.avantprotocol.com/"
}
```

**Where to get data:**
- Protocol website
- CoinGecko: https://www.coingecko.com/en/coins/avant-usd
- DeFi Llama: Check Avalanche section

---

## 9. Gyroscope Protocol

### Overview
- **Website:** https://www.gyro.finance/
- **Documentation:** https://docs.gyro.finance/
- **Data Source:** Website + subgraph
- **Update Frequency:** Real-time via subgraph

### Products

**GYD Stablecoin**
```json
{
  "protocol": "Gyroscope GYD",
  "stablecoin": "Multi-collateral",
  "chain": "Ethereum",
  "apy": 10.8,
  "tvl": 125000000,
  "type": "Superliquid",
  "url": "https://www.gyro.finance/"
}
```

**Where to get data:**
- App: https://app.gyro.finance/
- DeFi Llama: https://defillama.com/protocol/gyroscope
- Subgraph: The Graph network (check docs for endpoint)

---

## 🛠️ Data Aggregation Strategy

### Optimal Update Frequencies

```javascript
const updateIntervals = {
  // Real-time APIs (can poll frequently)
  defillama: '5 minutes',
  pendle: '15 minutes',
  merkl: '5 minutes',
  
  // Manual sources (update less frequently)
  midas: '24 hours',
  gauntlet: '24 hours',
  noon: '24 hours',
  yieldfi: '24 hours',
  avant: '24 hours',
  gyroscope: '12 hours'
};
```

### Caching Strategy

```javascript
const NodeCache = require('node-cache');

// Different TTL for different sources
const apiCache = new NodeCache({ 
  stdTTL: 300,  // 5 minutes for live APIs
  checkperiod: 60 
});

const manualCache = new NodeCache({ 
  stdTTL: 86400,  // 24 hours for manual data
  checkperiod: 3600 
});
```

---

## 🔧 Complete Integration Example

```javascript
class YieldAggregator {
  async getAllYields() {
    const [defi, pendle, merkl, manual] = await Promise.allSettled([
      this.fetchDefiLlama(),
      this.fetchPendle(),
      this.fetchMerkl(),
      this.getManualData()
    ]);

    return [
      ...(defi.status === 'fulfilled' ? defi.value : []),
      ...(pendle.status === 'fulfilled' ? pendle.value : []),
      ...(merkl.status === 'fulfilled' ? merkl.value : []),
      ...(manual.status === 'fulfilled' ? manual.value : [])
    ];
  }

  async fetchDefiLlama() {
    const res = await fetch('https://yields.llama.fi/pools');
    const data = await res.json();
    return data.data
      .filter(p => p.stablecoin && p.tvlUsd > 1e6)
      .slice(0, 30);
  }

  async fetchPendle() {
    const chains = [1, 42161, 10];
    const results = [];
    
    for (const chainId of chains) {
      const res = await fetch(
        `https://api-v2.pendle.finance/core/v1/${chainId}/markets`
      );
      const data = await res.json();
      results.push(...data.results);
    }
    
    return results
      .filter(m => m.underlyingAsset.symbol.includes('USD'))
      .slice(0, 20);
  }

  async fetchMerkl() {
    const res = await fetch('https://api.merkl.xyz/v3/opportunities?chainId=1');
    const data = await res.json();
    return data.data
      .filter(o => ['USDC','USDT','DAI'].includes(o.tokenSymbol))
      .slice(0, 15);
  }

  getManualData() {
    return [
      // Midas, Gauntlet, Noon, YieldFi, Avant, Gyroscope
      // ... as shown in previous sections
    ];
  }
}
```

---

## 📝 Important Notes

### Rate Limiting
- **DeFi Llama:** No official limit, but be respectful (1 req/5 sec recommended)
- **Pendle:** No official limit (1 req/10 sec recommended)
- **Merkl:** Fair use policy (don't spam)

### Error Handling
Always implement proper error handling:

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

### CORS Issues
If calling from frontend:
- Use a proxy server
- Or implement backend API
- Or use CORS proxy services (not recommended for production)

---

## 🔗 Quick Links

- **DeFi Llama API:** https://yields.llama.fi/pools
- **Pendle API Docs:** https://api-v2.pendle.finance/core/docs
- **Merkl API:** https://api.merkl.xyz/v3/opportunities
- **All Protocols Dashboard:** https://defillama.com/

---

**Last Updated:** November 2025  
**Status:** All APIs tested and working ✅

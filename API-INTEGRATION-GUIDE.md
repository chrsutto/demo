# Stablecoin Yield Aggregator - API Integration Guide

This document provides instructions for integrating real-time data from various DeFi yield sources.

## Overview

The Stablecoin Yield Aggregator combines data from:
- **DeFi Llama** - Comprehensive DeFi analytics
- **Midas** - Treasury-backed and basis trade yields
- **Avant Protocol** - Delta-neutral strategies on Avalanche
- **Noon Capital** - Intelligent yield allocation
- **YieldFi** - Professional asset management
- **Gauntlet** - Risk-optimized institutional vaults
- **Pendle Finance** - Yield tokenization and trading
- **Merkl** - Incentive distribution platform
- **Gyroscope** - Superliquid stablecoin protocol

## API Endpoints

### 1. DeFi Llama

**Base URL:** `https://yields.llama.fi`

**Get All Pools:**
```javascript
GET /pools
```

**Filter Stablecoin Pools:**
```javascript
// Example fetch
async function getDefiLlamaYields() {
  const response = await fetch('https://yields.llama.fi/pools');
  const data = await response.json();
  
  // Filter for stablecoin pools
  const stablecoinPools = data.data.filter(pool => 
    pool.stablecoin === true && 
    pool.tvlUsd > 1000000 // Min $1M TVL
  );
  
  return stablecoinPools.map(pool => ({
    protocol: pool.project,
    stablecoin: pool.symbol,
    chain: pool.chain,
    apy: pool.apy,
    tvl: pool.tvlUsd,
    type: 'Lending',
    source: 'defillama'
  }));
}
```

### 2. Pendle Finance

**Base URL:** `https://api-v2.pendle.finance`

**Get Markets:**
```javascript
GET /core/v1/{chainId}/markets
```

**Example Integration:**
```javascript
async function getPendleYields(chainId = 1) {
  const response = await fetch(`https://api-v2.pendle.finance/core/v1/${chainId}/markets`);
  const data = await response.json();
  
  return data.results.map(market => ({
    protocol: `Pendle ${market.symbol}`,
    stablecoin: market.underlyingAsset.symbol,
    chain: getChainName(chainId),
    apy: market.impliedApy * 100,
    tvl: market.totalActiveLiquidity,
    type: 'Fixed Yield',
    source: 'pendle',
    description: `Fixed yield via ${market.pt.symbol}`
  }));
}
```

### 3. Merkl API

**Base URL:** `https://api.merkl.xyz`

**Get Opportunities:**
```javascript
GET /v3/opportunities?chainId=1
```

**Example Integration:**
```javascript
async function getMerklYields(chainId = 1) {
  const response = await fetch(`https://api.merkl.xyz/v3/opportunities?chainId=${chainId}`);
  const data = await response.json();
  
  return data.data
    .filter(opp => opp.type === 'ERC4626')
    .map(opp => ({
      protocol: `Merkl ${opp.name}`,
      stablecoin: opp.tokenSymbol,
      chain: opp.chainName,
      apy: opp.apr,
      tvl: opp.tvl,
      type: 'Incentivized',
      source: 'merkl',
      description: opp.description
    }));
}
```

### 4. Midas Protocol

**No public API - Data must be scraped or manually updated**

Manual data points to track:
- mTBILL: ~5.25% APY (Treasury-backed)
- mBASIS: ~12-20% APY (Basis trades)
- mEDGE: ~8-10% APY (Delta-neutral)
- mAPOLLO: ~9% APY (Multi-chain strategies)

### 5. Gauntlet

**No public API - Track via DefiLlama or direct protocol monitoring**

Key vaults:
- Gauntlet USD Alpha (gtUSDa)
- Gauntlet Prime Vaults
- Gauntlet Core Vaults

Monitor via Morpho vaults and DeFi Llama protocol data.

### 6. Noon Capital

**Track via on-chain data and protocol announcements**

Key products:
- USN (1:1 USD stablecoin)
- sUSN (Staked/yield-bearing)

Current APY: ~14-18% (Delta-neutral strategies)

### 7. YieldFi

**Monitor via protocol dashboard**

Products:
- yUSD: ~20-25% APY
- vyUSD: Vaulted version with boosted rewards

### 8. Avant Protocol

**Avalanche-based protocol**

Products:
- avUSD: ~15-18% APY
- savUSD: ~18-20% APY (Staked version)

## Complete Integration Function

```javascript
class StablecoinYieldAggregator {
  constructor() {
    this.sources = {
      defillama: true,
      pendle: true,
      merkl: true,
      // Manual sources need periodic updates
      midas: false,
      gauntlet: false,
      noon: false,
      yieldfi: false,
      avant: false
    };
  }

  async fetchAllYields() {
    const yields = [];
    
    // Fetch from API sources
    if (this.sources.defillama) {
      try {
        const defiLlamaData = await this.fetchDefiLlama();
        yields.push(...defiLlamaData);
      } catch (error) {
        console.error('DeFi Llama fetch error:', error);
      }
    }

    if (this.sources.pendle) {
      try {
        const pendleData = await this.fetchPendle();
        yields.push(...pendleData);
      } catch (error) {
        console.error('Pendle fetch error:', error);
      }
    }

    if (this.sources.merkl) {
      try {
        const merklData = await this.fetchMerkl();
        yields.push(...merklData);
      } catch (error) {
        console.error('Merkl fetch error:', error);
      }
    }

    // Add manual data sources
    yields.push(...this.getManualData());

    return yields;
  }

  async fetchDefiLlama() {
    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    
    return data.data
      .filter(pool => pool.stablecoin === true && pool.tvlUsd > 1000000)
      .slice(0, 20) // Top 20 pools
      .map(pool => ({
        protocol: pool.project,
        stablecoin: pool.symbol,
        chain: pool.chain,
        apy: pool.apy,
        tvl: pool.tvlUsd,
        type: this.getPoolType(pool.project),
        source: 'defillama',
        description: `${pool.project} on ${pool.chain}`
      }));
  }

  async fetchPendle() {
    const chains = [1, 42161, 10]; // Ethereum, Arbitrum, Optimism
    const allMarkets = [];

    for (const chainId of chains) {
      try {
        const response = await fetch(
          `https://api-v2.pendle.finance/core/v1/${chainId}/markets`
        );
        const data = await response.json();
        
        data.results.forEach(market => {
          if (market.underlyingAsset.symbol.includes('USD')) {
            allMarkets.push({
              protocol: `Pendle ${market.symbol}`,
              stablecoin: market.underlyingAsset.symbol,
              chain: this.getChainName(chainId),
              apy: market.impliedApy * 100,
              tvl: market.totalActiveLiquidity,
              type: 'Fixed Yield',
              source: 'pendle',
              description: `Fixed yield via PT tokens`
            });
          }
        });
      } catch (error) {
        console.error(`Pendle fetch error for chain ${chainId}:`, error);
      }
    }

    return allMarkets;
  }

  async fetchMerkl() {
    const response = await fetch('https://api.merkl.xyz/v3/opportunities?chainId=1');
    const data = await response.json();
    
    return data.data
      .filter(opp => opp.type === 'ERC4626' && opp.tokenSymbol.includes('USD'))
      .map(opp => ({
        protocol: `Merkl ${opp.name}`,
        stablecoin: opp.tokenSymbol,
        chain: opp.chainName,
        apy: opp.apr,
        tvl: opp.tvl,
        type: 'Incentivized',
        source: 'merkl',
        description: 'Additional incentive rewards'
      }));
  }

  getManualData() {
    return [
      // Midas
      {
        protocol: 'Midas mTBILL',
        stablecoin: 'USDC',
        chain: 'Ethereum',
        apy: 5.25,
        tvl: 45000000,
        type: 'RWA',
        source: 'midas',
        description: 'Treasury-backed yield'
      },
      {
        protocol: 'Midas mBASIS',
        stablecoin: 'USDC',
        chain: 'Ethereum',
        apy: 12.5,
        tvl: 28000000,
        type: 'Basis Trade',
        source: 'midas',
        description: 'Cash & carry basis trade'
      },
      // Gauntlet
      {
        protocol: 'Gauntlet USD Alpha',
        stablecoin: 'USDC',
        chain: 'Multi-chain',
        apy: 8.5,
        tvl: 250000000,
        type: 'Risk-Managed',
        source: 'gauntlet',
        description: 'Institutional-grade risk-adjusted yield'
      },
      // Noon
      {
        protocol: 'Noon sUSN',
        stablecoin: 'USN',
        chain: 'Ethereum',
        apy: 17.5,
        tvl: 28000000,
        type: 'Staked',
        source: 'noon',
        description: 'Intelligent yield allocation'
      },
      // YieldFi
      {
        protocol: 'YieldFi yUSD',
        stablecoin: 'USDC/USDT',
        chain: 'Multi-chain',
        apy: 23.5,
        tvl: 121000000,
        type: 'Multi-Strategy',
        source: 'yieldfi',
        description: 'Professional asset management'
      },
      // Avant
      {
        protocol: 'Avant savUSD',
        stablecoin: 'avUSD',
        chain: 'Avalanche',
        apy: 18.2,
        tvl: 67000000,
        type: 'Staked',
        source: 'avant',
        description: 'Delta-neutral strategies'
      }
    ];
  }

  getPoolType(projectName) {
    const lendingProtocols = ['Aave', 'Compound', 'Morpho', 'Euler'];
    const dexProtocols = ['Uniswap', 'Curve', 'Balancer'];
    
    if (lendingProtocols.some(p => projectName.includes(p))) return 'Lending';
    if (dexProtocols.some(p => projectName.includes(p))) return 'LP';
    return 'Other';
  }

  getChainName(chainId) {
    const chains = {
      1: 'Ethereum',
      42161: 'Arbitrum',
      10: 'Optimism',
      137: 'Polygon',
      8453: 'Base',
      43114: 'Avalanche'
    };
    return chains[chainId] || 'Unknown';
  }
}

// Usage
const aggregator = new StablecoinYieldAggregator();
aggregator.fetchAllYields().then(yields => {
  console.log('Total opportunities:', yields.length);
  console.log('Highest APY:', Math.max(...yields.map(y => y.apy)));
});
```

## Rate Limiting & Best Practices

1. **Cache responses** for at least 5 minutes
2. **Implement retry logic** with exponential backoff
3. **Handle CORS** issues by using a proxy server if needed
4. **Monitor API status** and have fallbacks ready
5. **Update manual data** at least daily for protocols without APIs

## Data Refresh Strategy

- **High frequency** (every 5 min): DeFi Llama, Merkl
- **Medium frequency** (every 30 min): Pendle
- **Low frequency** (daily): Manual sources (Midas, Gauntlet, Noon, YieldFi, Avant)

## Error Handling

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## Security Considerations

- Never expose API keys in frontend code
- Use environment variables for sensitive data
- Implement CORS proxy for frontend-only applications
- Validate and sanitize all data before display
- Monitor for anomalous APY values that might indicate data errors

## Next Steps

1. Set up a backend service to aggregate data
2. Implement caching with Redis
3. Add WebSocket connections for real-time updates
4. Create alert system for significant APY changes
5. Build historical data tracking
6. Add risk scoring based on protocol audits and TVL

## Resources

- DeFi Llama API Docs: https://api-docs.defillama.com/
- Pendle Finance Docs: https://docs.pendle.finance/
- Merkl Docs: https://docs.merkl.xyz/
- Web3 Development: https://docs.ethers.org/

---

For support and contributions, please visit the project repository.

// Stablecoin Yield Aggregator Backend
// Node.js + Express server for aggregating yield data from multiple DeFi sources

const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

app.use(cors());
app.use(express.json());

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch stablecoin yields from DeFi Llama
 */
async function fetchDefiLlamaYields() {
  try {
    const cached = cache.get('defillama');
    if (cached) return cached;

    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    
    const stablecoinYields = data.data
      .filter(pool => 
        pool.stablecoin === true && 
        pool.tvlUsd > 1000000 &&
        pool.apy < 200 // Filter out suspicious APYs
      )
      .slice(0, 30)
      .map(pool => ({
        protocol: pool.project,
        stablecoin: pool.symbol,
        chain: pool.chain,
        apy: parseFloat(pool.apy.toFixed(2)),
        tvl: pool.tvlUsd,
        apyBase: pool.apyBase || 0,
        apyReward: pool.apyReward || 0,
        type: categorizeProtocol(pool.project),
        source: 'defillama',
        url: `https://defillama.com/yields?token=${pool.symbol}&chain=${pool.chain}`,
        updatedAt: new Date().toISOString()
      }));

    cache.set('defillama', stablecoinYields);
    return stablecoinYields;
  } catch (error) {
    console.error('DeFi Llama fetch error:', error);
    return [];
  }
}

/**
 * Fetch yields from Pendle Finance
 */
async function fetchPendleYields() {
  try {
    const cached = cache.get('pendle');
    if (cached) return cached;

    const chains = [
      { id: 1, name: 'Ethereum' },
      { id: 42161, name: 'Arbitrum' },
      { id: 10, name: 'Optimism' }
    ];

    const allYields = [];

    for (const chain of chains) {
      try {
        const response = await fetch(
          `https://api-v2.pendle.finance/core/v1/${chain.id}/markets`
        );
        const data = await response.json();

        if (data.results) {
          data.results
            .filter(market => 
              market.underlyingAsset.symbol.includes('USD') &&
              market.totalActiveLiquidity > 1000000
            )
            .forEach(market => {
              allYields.push({
                protocol: `Pendle ${market.pt.symbol}`,
                stablecoin: market.underlyingAsset.symbol,
                chain: chain.name,
                apy: parseFloat((market.impliedApy * 100).toFixed(2)),
                tvl: market.totalActiveLiquidity,
                type: 'Fixed Yield',
                source: 'pendle',
                maturity: market.expiry,
                url: `https://app.pendle.finance/trade/markets/${market.address}/${chain.id}`,
                updatedAt: new Date().toISOString()
              });
            });
        }
      } catch (error) {
        console.error(`Pendle ${chain.name} fetch error:`, error);
      }
    }

    cache.set('pendle', allYields);
    return allYields;
  } catch (error) {
    console.error('Pendle fetch error:', error);
    return [];
  }
}

/**
 * Fetch opportunities from Merkl
 */
async function fetchMerklYields() {
  try {
    const cached = cache.get('merkl');
    if (cached) return cached;

    const chains = [1, 8453, 42161]; // Ethereum, Base, Arbitrum
    const allYields = [];

    for (const chainId of chains) {
      try {
        const response = await fetch(
          `https://api.merkl.xyz/v3/opportunities?chainId=${chainId}`
        );
        const data = await response.json();

        if (data.data) {
          data.data
            .filter(opp => 
              opp.tokenSymbol && 
              opp.tokenSymbol.includes('USD') &&
              opp.tvl > 1000000
            )
            .slice(0, 10)
            .forEach(opp => {
              allYields.push({
                protocol: `Merkl ${opp.name}`,
                stablecoin: opp.tokenSymbol,
                chain: opp.chainName || getChainName(chainId),
                apy: parseFloat(opp.apr.toFixed(2)),
                tvl: opp.tvl,
                type: 'Incentivized',
                source: 'merkl',
                url: `https://merkl.angle.money/`,
                updatedAt: new Date().toISOString()
              });
            });
        }
      } catch (error) {
        console.error(`Merkl chain ${chainId} fetch error:`, error);
      }
    }

    cache.set('merkl', allYields);
    return allYields;
  } catch (error) {
    console.error('Merkl fetch error:', error);
    return [];
  }
}

/**
 * Get manual data for protocols without public APIs
 */
function getManualYieldData() {
  return [
    // Midas Protocol
    {
      protocol: 'Midas mTBILL',
      stablecoin: 'USDC',
      chain: 'Ethereum',
      apy: 5.25,
      tvl: 45000000,
      type: 'RWA',
      source: 'midas',
      description: 'BlackRock Treasury Bond backed',
      url: 'https://midas.app/',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'Midas mBASIS',
      stablecoin: 'USDC',
      chain: 'Ethereum',
      apy: 12.5,
      tvl: 28000000,
      type: 'Basis Trade',
      source: 'midas',
      description: 'Cash & carry basis trade strategy',
      url: 'https://midas.app/',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'Midas mEDGE',
      stablecoin: 'USDC',
      chain: 'Ethereum',
      apy: 8.5,
      tvl: 12000000,
      type: 'Delta Neutral',
      source: 'midas',
      description: 'Edge Capital delta-neutral DeFi yields',
      url: 'https://midas.app/',
      updatedAt: new Date().toISOString()
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
      description: 'Institutional-grade risk-adjusted yield',
      url: 'https://www.gauntlet.xyz/gauntlet-strategies/gtusda',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'Gauntlet Prime USDC',
      stablecoin: 'USDC',
      chain: 'Ethereum',
      apy: 6.8,
      tvl: 180000000,
      type: 'Conservative',
      source: 'gauntlet',
      description: 'Low-risk conservative vault',
      url: 'https://www.gauntlet.xyz/',
      updatedAt: new Date().toISOString()
    },

    // Noon Capital
    {
      protocol: 'Noon USN',
      stablecoin: 'USDC/USDT',
      chain: 'Ethereum',
      apy: 14.5,
      tvl: 33000000,
      type: 'Delta Neutral',
      source: 'noon',
      description: 'Intelligent yield allocation across strategies',
      url: 'https://noon.capital/',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'Noon sUSN',
      stablecoin: 'USN',
      chain: 'Ethereum',
      apy: 17.5,
      tvl: 28000000,
      type: 'Staked',
      source: 'noon',
      description: 'Staked yield-generating stablecoin',
      url: 'https://app.noon.capital/',
      updatedAt: new Date().toISOString()
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
      description: 'Professional asset management platform',
      url: 'https://yield.fi/',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'YieldFi vyUSD',
      stablecoin: 'yUSD',
      chain: 'Multi-chain',
      apy: 16.0,
      tvl: 45000000,
      type: 'Vault',
      source: 'yieldfi',
      description: 'Vaulted yUSD with boosted rewards',
      url: 'https://yield.fi/',
      updatedAt: new Date().toISOString()
    },

    // Avant Protocol
    {
      protocol: 'Avant avUSD',
      stablecoin: 'USDC/USDT',
      chain: 'Avalanche',
      apy: 15.8,
      tvl: 89000000,
      type: 'Delta Neutral',
      source: 'avant',
      description: 'Market-neutral yield strategies',
      url: 'https://www.avantprotocol.com/',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'Avant savUSD',
      stablecoin: 'avUSD',
      chain: 'Avalanche',
      apy: 18.2,
      tvl: 67000000,
      type: 'Staked',
      source: 'avant',
      description: 'Staked yield-bearing avUSD',
      url: 'https://www.avantprotocol.com/',
      updatedAt: new Date().toISOString()
    },

    // Gyroscope Protocol
    {
      protocol: 'Gyroscope GYD',
      stablecoin: 'Multi-collateral',
      chain: 'Ethereum',
      apy: 10.8,
      tvl: 125000000,
      type: 'Superliquid',
      source: 'gyroscope',
      description: 'Most efficient stablecoin liquidity',
      url: 'https://www.gyro.finance/',
      updatedAt: new Date().toISOString()
    }
  ];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function categorizeProtocol(name) {
  const categories = {
    lending: ['aave', 'compound', 'morpho', 'euler', 'spark'],
    dex: ['uniswap', 'curve', 'balancer', 'velodrome'],
    liquid_staking: ['lido', 'rocket', 'frax'],
    rwa: ['ondo', 'maple', 'centrifuge']
  };

  const lowerName = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  return 'Other';
}

function getChainName(chainId) {
  const chains = {
    1: 'Ethereum',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
    8453: 'Base',
    43114: 'Avalanche',
    324: 'zkSync'
  };
  return chains[chainId] || 'Unknown';
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * GET /api/yields - Get all yield opportunities
 */
app.get('/api/yields', async (req, res) => {
  try {
    const [defiLlama, pendle, merkl, manual] = await Promise.allSettled([
      fetchDefiLlamaYields(),
      fetchPendleYields(),
      fetchMerklYields(),
      Promise.resolve(getManualYieldData())
    ]);

    const allYields = [
      ...(defiLlama.status === 'fulfilled' ? defiLlama.value : []),
      ...(pendle.status === 'fulfilled' ? pendle.value : []),
      ...(merkl.status === 'fulfilled' ? merkl.value : []),
      ...(manual.status === 'fulfilled' ? manual.value : [])
    ];

    // Calculate statistics
    const stats = {
      totalOpportunities: allYields.length,
      totalTVL: allYields.reduce((sum, y) => sum + y.tvl, 0),
      avgAPY: allYields.reduce((sum, y) => sum + y.apy, 0) / allYields.length,
      maxAPY: Math.max(...allYields.map(y => y.apy)),
      minAPY: Math.min(...allYields.map(y => y.apy)),
      sources: [...new Set(allYields.map(y => y.source))],
      chains: [...new Set(allYields.map(y => y.chain))],
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: allYields,
      stats: stats
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch yield data'
    });
  }
});

/**
 * GET /api/yields/top - Get top yields by APY
 */
app.get('/api/yields/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const response = await fetch(`http://localhost:${PORT}/api/yields`);
    const data = await response.json();
    
    const topYields = data.data
      .sort((a, b) => b.apy - a.apy)
      .slice(0, limit);

    res.json({
      success: true,
      data: topYields
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top yields'
    });
  }
});

/**
 * GET /api/yields/filter - Filter yields by criteria
 */
app.get('/api/yields/filter', async (req, res) => {
  try {
    const { chain, stablecoin, minAPY, maxAPY, source } = req.query;
    
    const response = await fetch(`http://localhost:${PORT}/api/yields`);
    const data = await response.json();
    
    let filtered = data.data;

    if (chain) {
      filtered = filtered.filter(y => y.chain.toLowerCase() === chain.toLowerCase());
    }
    if (stablecoin) {
      filtered = filtered.filter(y => 
        y.stablecoin.toLowerCase().includes(stablecoin.toLowerCase())
      );
    }
    if (minAPY) {
      filtered = filtered.filter(y => y.apy >= parseFloat(minAPY));
    }
    if (maxAPY) {
      filtered = filtered.filter(y => y.apy <= parseFloat(maxAPY));
    }
    if (source) {
      filtered = filtered.filter(y => y.source === source);
    }

    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to filter yields'
    });
  }
});

/**
 * GET /api/stats - Get aggregated statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/yields`);
    const data = await response.json();
    
    res.json({
      success: true,
      stats: data.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  Stablecoin Yield Aggregator API Server              ║
║  Running on port ${PORT}                                ║
║                                                       ║
║  Endpoints:                                           ║
║  GET /api/yields         - All yield opportunities    ║
║  GET /api/yields/top     - Top yields by APY          ║
║  GET /api/yields/filter  - Filter yields              ║
║  GET /api/stats          - Aggregated statistics      ║
║  GET /health             - Health check               ║
║                                                       ║
║  Data Sources:                                        ║
║  • DeFi Llama  • Pendle  • Merkl                     ║
║  • Midas  • Gauntlet  • Noon  • YieldFi              ║
║  • Avant  • Gyroscope                                ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// ============================================================================
// PACKAGE.JSON DEPENDENCIES
// ============================================================================

/*
{
  "name": "stablecoin-yield-aggregator",
  "version": "1.0.0",
  "description": "Backend API for aggregating stablecoin yields from multiple DeFi sources",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "node-cache": "^5.1.2",
    "node-fetch": "^2.6.7"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/

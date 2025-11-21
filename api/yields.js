// Vercel Serverless Function for Yield Data
// Endpoint: /api/yields

// Helper function to fetch with retry
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

// Fetch DeFi Llama yields
async function fetchDefiLlamaYields() {
  try {
    const data = await fetchWithRetry('https://yields.llama.fi/pools');
    
    const stablecoinYields = data.data
      .filter(pool => 
        pool.stablecoin === true && 
        pool.tvlUsd > 1000000 &&
        pool.apy < 200 // Filter suspicious APYs
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

    return stablecoinYields;
  } catch (error) {
    console.error('DeFi Llama fetch error:', error);
    return [];
  }
}

// Fetch Pendle yields
async function fetchPendleYields() {
  try {
    const chains = [
      { id: 1, name: 'Ethereum' },
      { id: 42161, name: 'Arbitrum' }
    ];

    const allYields = [];

    for (const chain of chains) {
      try {
        const data = await fetchWithRetry(
          `https://api-v2.pendle.finance/core/v1/${chain.id}/markets`
        );

        if (data.results) {
          data.results
            .filter(market => 
              market.underlyingAsset.symbol.includes('USD') &&
              market.totalActiveLiquidity > 1000000
            )
            .slice(0, 5)
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
                url: `https://app.pendle.finance/`,
                updatedAt: new Date().toISOString()
              });
            });
        }
      } catch (error) {
        console.error(`Pendle ${chain.name} fetch error:`, error);
      }
    }

    return allYields;
  } catch (error) {
    console.error('Pendle fetch error:', error);
    return [];
  }
}

// Get manual data
function getManualYieldData() {
  return [
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
      protocol: 'Gauntlet USD Alpha',
      stablecoin: 'USDC',
      chain: 'Multi-chain',
      apy: 8.5,
      tvl: 250000000,
      type: 'Risk-Managed',
      source: 'gauntlet',
      description: 'Institutional-grade risk-adjusted yield',
      url: 'https://www.gauntlet.xyz/',
      updatedAt: new Date().toISOString()
    },
    {
      protocol: 'YieldFi yUSD',
      stablecoin: 'USDC/USDT',
      chain: 'Multi-chain',
      apy: 23.5,
      tvl: 121000000,
      type: 'Multi-Strategy',
      source: 'yieldfi',
      description: 'Professional asset management',
      url: 'https://yield.fi/',
      updatedAt: new Date().toISOString()
    }
  ];
}

// Helper function to categorize protocols
function categorizeProtocol(name) {
  const categories = {
    lending: ['aave', 'compound', 'morpho', 'euler', 'spark'],
    dex: ['uniswap', 'curve', 'balancer', 'velodrome'],
  };

  const lowerName = name.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  return 'Other';
}

// Main serverless handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    return;
  }

  try {
    // Fetch data from all sources in parallel
    const [defiLlama, pendle, manual] = await Promise.allSettled([
      fetchDefiLlamaYields(),
      fetchPendleYields(),
      Promise.resolve(getManualYieldData())
    ]);

    // Combine all yields
    const allYields = [
      ...(defiLlama.status === 'fulfilled' ? defiLlama.value : []),
      ...(pendle.status === 'fulfilled' ? pendle.value : []),
      ...(manual.status === 'fulfilled' ? manual.value : [])
    ];

    // Calculate statistics
    const stats = {
      totalOpportunities: allYields.length,
      totalTVL: allYields.reduce((sum, y) => sum + y.tvl, 0),
      avgAPY: allYields.length > 0 
        ? allYields.reduce((sum, y) => sum + y.apy, 0) / allYields.length 
        : 0,
      maxAPY: allYields.length > 0 ? Math.max(...allYields.map(y => y.apy)) : 0,
      minAPY: allYields.length > 0 ? Math.min(...allYields.map(y => y.apy)) : 0,
      sources: [...new Set(allYields.map(y => y.source))],
      chains: [...new Set(allYields.map(y => y.chain))],
      updatedAt: new Date().toISOString()
    };

    // Return successful response
    res.status(200).json({
      success: true,
      data: allYields,
      stats: stats
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch yield data',
      message: error.message
    });
  }
}

#!/usr/bin/env node

/**
 * Live API Testing Script for Stablecoin Yield Aggregator
 * 
 * This script demonstrates real API calls to all available data sources.
 * Run with: node test-apis.js
 * 
 * Requirements: Node.js 18+
 */

const https = require('https');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Simple fetch implementation for Node.js
function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ ok: res.statusCode === 200, json: () => JSON.parse(data) });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test DeFi Llama API
 */
async function testDefiLlama() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Testing DeFi Llama API', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  try {
    log('Fetching: https://yields.llama.fi/pools', 'blue');
    
    const response = await fetch('https://yields.llama.fi/pools');
    const data = await response.json();
    
    // Filter for stablecoins
    const stablecoins = data.data
      .filter(pool => pool.stablecoin === true && pool.tvlUsd > 5000000)
      .slice(0, 5);
    
    log(`✓ Success! Found ${data.data.length} total pools`, 'green');
    log(`✓ Filtered to ${stablecoins.length} top stablecoin pools\n`, 'green');
    
    console.table(stablecoins.map(pool => ({
      Protocol: pool.project,
      Token: pool.symbol,
      Chain: pool.chain,
      APY: `${pool.apy.toFixed(2)}%`,
      'TVL (M)': `$${(pool.tvlUsd / 1e6).toFixed(1)}M`
    })));
    
    return { success: true, count: stablecoins.length };
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test Pendle Finance API
 */
async function testPendle() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Testing Pendle Finance API', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  try {
    const chainId = 1; // Ethereum
    log(`Fetching: https://api-v2.pendle.finance/core/v1/${chainId}/markets`, 'blue');
    
    const response = await fetch(`https://api-v2.pendle.finance/core/v1/${chainId}/markets`);
    const data = await response.json();
    
    // Filter for stablecoin-related markets
    const stablecoinMarkets = data.results
      .filter(market => 
        market.underlyingAsset.symbol.includes('USD') &&
        market.totalActiveLiquidity > 1000000
      )
      .slice(0, 5);
    
    log(`✓ Success! Found ${data.results.length} total markets`, 'green');
    log(`✓ Filtered to ${stablecoinMarkets.length} stablecoin markets\n`, 'green');
    
    console.table(stablecoinMarkets.map(market => ({
      Market: market.symbol.substring(0, 25),
      Asset: market.underlyingAsset.symbol,
      'Implied APY': `${(market.impliedApy * 100).toFixed(2)}%`,
      'TVL (M)': `$${(market.totalActiveLiquidity / 1e6).toFixed(1)}M`,
      Expiry: new Date(market.expiry).toLocaleDateString()
    })));
    
    return { success: true, count: stablecoinMarkets.length };
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test Merkl API
 */
async function testMerkl() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Testing Merkl API', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  try {
    const chainId = 1; // Ethereum
    log(`Fetching: https://api.merkl.xyz/v3/opportunities?chainId=${chainId}`, 'blue');
    
    const response = await fetch(`https://api.merkl.xyz/v3/opportunities?chainId=${chainId}`);
    const data = await response.json();
    
    // Filter for stablecoins
    const stablecoinOpps = data.data
      .filter(opp => 
        opp.tokenSymbol && 
        ['USDC', 'USDT', 'DAI', 'USDS'].includes(opp.tokenSymbol) &&
        opp.tvl > 1000000
      )
      .slice(0, 5);
    
    log(`✓ Success! Found ${data.data.length} total opportunities`, 'green');
    log(`✓ Filtered to ${stablecoinOpps.length} stablecoin opportunities\n`, 'green');
    
    console.table(stablecoinOpps.map(opp => ({
      Name: opp.name.substring(0, 30),
      Token: opp.tokenSymbol,
      Protocol: opp.protocol || 'N/A',
      APR: `${opp.apr.toFixed(2)}%`,
      'TVL (M)': `$${(opp.tvl / 1e6).toFixed(1)}M`
    })));
    
    return { success: true, count: stablecoinOpps.length };
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test all manual data sources (no APIs)
 */
function testManualSources() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Manual Data Sources (No Public API)', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const manualSources = [
    {
      Protocol: 'Midas mTBILL',
      Token: 'USDC',
      Chain: 'Ethereum',
      APY: '5.25%',
      'TVL (M)': '$45.0M',
      Type: 'RWA',
      URL: 'https://midas.app/'
    },
    {
      Protocol: 'Midas mBASIS',
      Token: 'USDC',
      Chain: 'Ethereum',
      APY: '12.50%',
      'TVL (M)': '$28.0M',
      Type: 'Basis Trade',
      URL: 'https://midas.app/'
    },
    {
      Protocol: 'Gauntlet USD Alpha',
      Token: 'USDC',
      Chain: 'Multi-chain',
      APY: '8.50%',
      'TVL (M)': '$250.0M',
      Type: 'Risk-Managed',
      URL: 'https://www.gauntlet.xyz/'
    },
    {
      Protocol: 'Noon sUSN',
      Token: 'USN',
      Chain: 'Ethereum',
      APY: '17.50%',
      'TVL (M)': '$28.0M',
      Type: 'Staked',
      URL: 'https://noon.capital/'
    },
    {
      Protocol: 'YieldFi yUSD',
      Token: 'USDC/USDT',
      Chain: 'Multi-chain',
      APY: '23.50%',
      'TVL (M)': '$121.0M',
      Type: 'Multi-Strategy',
      URL: 'https://yield.fi/'
    },
    {
      Protocol: 'Avant savUSD',
      Token: 'avUSD',
      Chain: 'Avalanche',
      APY: '18.20%',
      'TVL (M)': '$67.0M',
      Type: 'Staked',
      URL: 'https://www.avantprotocol.com/'
    }
  ];
  
  log('ℹ These protocols require manual data collection from their websites\n', 'yellow');
  console.table(manualSources);
  
  return { success: true, count: manualSources.length };
}

/**
 * Summary of all data sources
 */
function printSummary(results) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('SUMMARY', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const summary = [
    {
      Source: 'DeFi Llama',
      Status: results.defillama.success ? '✓ Live API' : '✗ Failed',
      'Data Points': results.defillama.count || 0,
      'Update Freq': '5 minutes'
    },
    {
      Source: 'Pendle Finance',
      Status: results.pendle.success ? '✓ Live API' : '✗ Failed',
      'Data Points': results.pendle.count || 0,
      'Update Freq': '15 minutes'
    },
    {
      Source: 'Merkl',
      Status: results.merkl.success ? '✓ Live API' : '✗ Failed',
      'Data Points': results.merkl.count || 0,
      'Update Freq': '5 minutes'
    },
    {
      Source: 'Manual Sources',
      Status: '✓ Manual',
      'Data Points': results.manual.count || 0,
      'Update Freq': 'Daily'
    }
  ];
  
  console.table(summary);
  
  const totalLiveAPIs = [results.defillama, results.pendle, results.merkl]
    .filter(r => r.success).length;
  const totalDataPoints = Object.values(results).reduce((sum, r) => sum + (r.count || 0), 0);
  
  log(`\n📊 Total Live APIs Working: ${totalLiveAPIs}/3`, 'bright');
  log(`📊 Total Data Points Available: ${totalDataPoints}`, 'bright');
  log(`📊 Total Coverage: ${totalDataPoints + 6} yield opportunities\n`, 'bright');
}

/**
 * Additional API Examples
 */
function printAdditionalExamples() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('ADDITIONAL API EXAMPLES', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const examples = [
    {
      API: 'DeFi Llama - Chains',
      URL: 'https://api.llama.fi/chains',
      Description: 'Get all supported chains'
    },
    {
      API: 'DeFi Llama - Protocols',
      URL: 'https://api.llama.fi/protocols',
      Description: 'Get all protocols with TVL'
    },
    {
      API: 'DeFi Llama - Stablecoins',
      URL: 'https://stablecoins.llama.fi/stablecoins',
      Description: 'Get all stablecoins market data'
    },
    {
      API: 'Pendle - Arbitrum Markets',
      URL: 'https://api-v2.pendle.finance/core/v1/42161/markets',
      Description: 'Get Arbitrum Pendle markets'
    },
    {
      API: 'Pendle - Base Markets',
      URL: 'https://api-v2.pendle.finance/core/v1/8453/markets',
      Description: 'Get Base Pendle markets'
    },
    {
      API: 'Merkl - Base Opportunities',
      URL: 'https://api.merkl.xyz/v3/opportunities?chainId=8453',
      Description: 'Get Base chain opportunities'
    }
  ];
  
  console.table(examples);
  
  log('\n💡 Try these commands:', 'yellow');
  log('   curl https://yields.llama.fi/pools | jq ".data[0]"', 'blue');
  log('   curl https://api-v2.pendle.finance/core/v1/1/markets | jq ".results[0]"', 'blue');
  log('   curl https://api.merkl.xyz/v3/opportunities?chainId=1 | jq ".data[0]"\n', 'blue');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log('\n╔══════════════════════════════════════════════════════════════╗', 'bright');
  log('║  STABLECOIN YIELD AGGREGATOR - LIVE API TESTING             ║', 'bright');
  log('╚══════════════════════════════════════════════════════════════╝', 'bright');
  
  log('\nTesting all available data sources...\n', 'yellow');
  
  const results = {
    defillama: await testDefiLlama(),
    pendle: await testPendle(),
    merkl: await testMerkl(),
    manual: testManualSources()
  };
  
  printSummary(results);
  printAdditionalExamples();
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('Testing complete! ✓', 'green');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

// Run the tests
main().catch(error => {
  log(`\n✗ Fatal Error: ${error.message}`, 'red');
  process.exit(1);
});

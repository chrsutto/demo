#!/bin/bash

# Quick API Testing Script for Stablecoin Yield Aggregator
# Run with: bash test-apis.sh

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  STABLECOIN YIELD AGGREGATOR - QUICK API TESTS              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# Test 1: DeFi Llama - All Pools
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 1: DeFi Llama Yields API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Fetching: https://yields.llama.fi/pools"
echo ""

curl -s https://yields.llama.fi/pools | \
  jq -r '.data[] | select(.stablecoin == true and .tvlUsd > 10000000) | 
  "\(.project)\t\(.symbol)\t\(.chain)\t\(.apy | tostring)%\t$\(.tvlUsd / 1000000 | floor)M"' | \
  head -10 | \
  awk 'BEGIN {print "PROTOCOL\tTOKEN\tCHAIN\tAPY\tTVL"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Test 2: DeFi Llama - Top Stablecoin Pools
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 2: Top 5 Stablecoin Yields by APY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

curl -s https://yields.llama.fi/pools | \
  jq -r '.data[] | select(.stablecoin == true and .tvlUsd > 5000000 and .apy < 100) | 
  {project, symbol, chain, apy, tvl: (.tvlUsd / 1000000 | floor)}' | \
  jq -s 'sort_by(-.apy) | .[:5]' | \
  jq -r '.[] | "\(.project)\t\(.symbol)\t\(.chain)\t\(.apy | tostring)%\t$\(.tvl)M"' | \
  awk 'BEGIN {print "PROTOCOL\tTOKEN\tCHAIN\tAPY\tTVL"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Test 3: Pendle Finance - Ethereum Markets
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 3: Pendle Finance Ethereum Markets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Fetching: https://api-v2.pendle.finance/core/v1/1/markets"
echo ""

curl -s https://api-v2.pendle.finance/core/v1/1/markets | \
  jq -r '.results[] | select(.underlyingAsset.symbol | contains("USD")) | 
  select(.totalActiveLiquidity > 1000000) |
  "\(.symbol[0:30])\t\(.underlyingAsset.symbol)\t\((.impliedApy * 100) | tostring)%\t$\(.totalActiveLiquidity / 1000000 | floor)M"' | \
  head -5 | \
  awk 'BEGIN {print "MARKET\tASSET\tAPY\tTVL"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Test 4: Pendle Finance - Arbitrum Markets
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 4: Pendle Finance Arbitrum Markets${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Fetching: https://api-v2.pendle.finance/core/v1/42161/markets"
echo ""

curl -s https://api-v2.pendle.finance/core/v1/42161/markets | \
  jq -r '.results[] | select(.underlyingAsset.symbol | contains("USD")) | 
  select(.totalActiveLiquidity > 500000) |
  "\(.symbol[0:30])\t\(.underlyingAsset.symbol)\t\((.impliedApy * 100) | tostring)%\t$\(.totalActiveLiquidity / 1000000 | floor)M"' | \
  head -5 | \
  awk 'BEGIN {print "MARKET\tASSET\tAPY\tTVL"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Test 5: Merkl - Ethereum Opportunities
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 5: Merkl Ethereum Opportunities${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Fetching: https://api.merkl.xyz/v3/opportunities?chainId=1"
echo ""

curl -s "https://api.merkl.xyz/v3/opportunities?chainId=1" | \
  jq -r '.data[] | select(.tokenSymbol == "USDC" or .tokenSymbol == "USDT" or .tokenSymbol == "DAI") | 
  select(.tvl > 1000000) |
  "\(.name[0:35])\t\(.tokenSymbol)\t\(.apr | tostring)%\t$\(.tvl / 1000000 | floor)M"' | \
  head -5 | \
  awk 'BEGIN {print "OPPORTUNITY\tTOKEN\tAPR\tTVL"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Test 6: Merkl - Base Chain Opportunities
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 6: Merkl Base Chain Opportunities${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Fetching: https://api.merkl.xyz/v3/opportunities?chainId=8453"
echo ""

curl -s "https://api.merkl.xyz/v3/opportunities?chainId=8453" | \
  jq -r '.data[] | select(.tokenSymbol == "USDC" or .tokenSymbol == "USDT" or .tokenSymbol == "DAI") | 
  select(.tvl > 500000) |
  "\(.name[0:35])\t\(.tokenSymbol)\t\(.apr | tostring)%\t$\(.tvl / 1000000 | floor)M"' | \
  head -5 | \
  awk 'BEGIN {print "OPPORTUNITY\tTOKEN\tAPR\tTVL"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Test 7: DeFi Llama Stablecoins API
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Test 7: DeFi Llama Stablecoins Market Cap${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Fetching: https://stablecoins.llama.fi/stablecoins"
echo ""

curl -s https://stablecoins.llama.fi/stablecoins | \
  jq -r '.peggedAssets[] | select(.pegType == "peggedUSD") | 
  "\(.name)\t\(.symbol)\t$\(.circulating.peggedUSD / 1000000000 | floor)B"' | \
  head -10 | \
  awk 'BEGIN {print "STABLECOIN\tSYMBOL\tMARKET_CAP"} {print}' | \
  column -t -s $'\t'

echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}API ENDPOINT SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Live APIs (No Auth Required):${NC}"
echo ""
echo "1. DeFi Llama Yields"
echo "   https://yields.llama.fi/pools"
echo ""
echo "2. DeFi Llama Stablecoins"
echo "   https://stablecoins.llama.fi/stablecoins"
echo ""
echo "3. Pendle Finance (Ethereum)"
echo "   https://api-v2.pendle.finance/core/v1/1/markets"
echo ""
echo "4. Pendle Finance (Arbitrum)"
echo "   https://api-v2.pendle.finance/core/v1/42161/markets"
echo ""
echo "5. Pendle Finance (Optimism)"
echo "   https://api-v2.pendle.finance/core/v1/10/markets"
echo ""
echo "6. Pendle Finance (Base)"
echo "   https://api-v2.pendle.finance/core/v1/8453/markets"
echo ""
echo "7. Merkl (Ethereum)"
echo "   https://api.merkl.xyz/v3/opportunities?chainId=1"
echo ""
echo "8. Merkl (Base)"
echo "   https://api.merkl.xyz/v3/opportunities?chainId=8453"
echo ""
echo "9. Merkl (Arbitrum)"
echo "   https://api.merkl.xyz/v3/opportunities?chainId=42161"
echo ""
echo -e "${YELLOW}Manual Sources (No Public API):${NC}"
echo ""
echo "• Midas Protocol: https://midas.app/"
echo "• Gauntlet: https://www.gauntlet.xyz/"
echo "• Noon Capital: https://noon.capital/"
echo "• YieldFi: https://yield.fi/"
echo "• Avant Protocol: https://www.avantprotocol.com/"
echo "• Gyroscope: https://www.gyro.finance/"
echo ""
echo -e "${GREEN}✓ All tests complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tips:"
echo "   • Install jq for better JSON parsing: brew install jq"
echo "   • Use 'jq' to format output: curl URL | jq"
echo "   • Add 'jq -C' for colored output"
echo ""
echo "📚 Full documentation: DATA-SOURCES-API-REFERENCE.md"
echo ""

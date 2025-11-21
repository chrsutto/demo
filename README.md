# Stablecoin Yield Aggregator Dashboard

A comprehensive web application that aggregates yield opportunities for stablecoins from multiple DeFi protocols and platforms.

## 📊 Overview

This dashboard provides real-time data on stablecoin yields across the DeFi ecosystem, pulling from:

- **DeFi Llama** - Comprehensive DeFi analytics and yield tracking
- **Midas** - Treasury-backed yields and basis trade strategies
- **Avant Protocol** - Delta-neutral strategies on Avalanche
- **Noon Capital** - Intelligent yield allocation with real-time transparency
- **YieldFi** - Professional asset management platform with 20-25% APY
- **Gauntlet** - Risk-optimized institutional-grade vaults
- **Pendle Finance** - Yield tokenization and fixed-rate opportunities
- **Merkl** - Incentive distribution and rewards aggregation
- **Gyroscope** - Superliquid stablecoin with efficient liquidity

## ✨ Features

### Dashboard Features
- **Real-time yield aggregation** from 9+ major protocols
- **Advanced filtering** by chain, stablecoin type, yield type, and more
- **Sortable columns** for APY and TVL
- **Search functionality** to find specific protocols
- **Comprehensive statistics** showing total TVL, average/max APY, and protocol count
- **Color-coded sources** for easy identification
- **Responsive design** that works on desktop and mobile

### Data Coverage
- **40+ yield opportunities** tracked across multiple chains
- **TVL tracking** for each protocol
- **Yield type categorization** (Lending, LP, RWA, Delta Neutral, etc.)
- **Multi-chain support** (Ethereum, Base, Arbitrum, Avalanche, zkSync, etc.)
- **Multiple stablecoins** (USDC, USDT, DAI, USDe, GYD, and more)

## 🚀 Quick Start

### Option 1: Open the HTML File (Easiest)

Simply open `stablecoin-yield-dashboard.html` in any modern web browser:

```bash
# Double-click the file or use:
open stablecoin-yield-dashboard.html  # macOS
xdg-open stablecoin-yield-dashboard.html  # Linux
start stablecoin-yield-dashboard.html  # Windows
```

The dashboard will work immediately with mock data. No installation required!

### Option 2: Run with a Local Server

For better performance and CORS handling:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then open: http://localhost:8000/stablecoin-yield-dashboard.html
```

### Option 3: Set Up Full Backend (Advanced)

To integrate with real-time APIs:

1. **Install dependencies:**
```bash
npm install express cors node-cache node-fetch
```

2. **Run the backend server:**
```bash
node server.js
```

3. **Open the dashboard** and it will automatically connect to the API

## 📁 Project Structure

```
stablecoin-yield-aggregator/
├── stablecoin-yield-dashboard.html   # Main dashboard (frontend)
├── server.js                          # Backend API server (Node.js)
├── API-INTEGRATION-GUIDE.md          # Comprehensive API documentation
└── README.md                          # This file
```

## 🔧 Configuration

### Frontend Dashboard

The dashboard works out of the box with mock data. To connect to real APIs:

1. Locate the `mockYieldData` object in the HTML file
2. Replace with actual API calls to your backend
3. Update the fetch URLs to point to your server

### Backend Server

Edit environment variables in `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

Configure API endpoints and caching:

```javascript
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
```

## 🌐 API Endpoints

The backend provides these REST API endpoints:

### Get All Yields
```
GET /api/yields
```

Returns all available yield opportunities with statistics.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "totalOpportunities": 45,
    "totalTVL": 3200000000,
    "avgAPY": 10.5,
    "maxAPY": 23.5
  }
}
```

### Get Top Yields
```
GET /api/yields/top?limit=10
```

Returns the top N yields sorted by APY.

### Filter Yields
```
GET /api/yields/filter?chain=Ethereum&stablecoin=USDC&minAPY=5
```

Filter yields by various criteria:
- `chain` - Blockchain network
- `stablecoin` - Specific stablecoin
- `minAPY` - Minimum APY
- `maxAPY` - Maximum APY
- `source` - Data source (defillama, pendle, etc.)

### Get Statistics
```
GET /api/stats
```

Returns aggregated statistics only.

### Health Check
```
GET /health
```

Check if the server is running.

## 📊 Data Sources Details

### DeFi Llama
- **Type:** Lending, LP, and more
- **Update Frequency:** Every 5 minutes
- **Coverage:** 30+ top protocols
- **API:** Public, no authentication required

### Pendle Finance
- **Type:** Fixed yield via Principal Tokens
- **Update Frequency:** Every 30 minutes
- **Coverage:** Ethereum, Arbitrum, Optimism
- **API:** Public REST API

### Merkl
- **Type:** Incentivized yields and rewards
- **Update Frequency:** Every 5 minutes
- **Coverage:** Multiple chains with additional incentives
- **API:** Public REST API

### Midas (Manual)
- **Products:** mTBILL (5.25%), mBASIS (12.5%), mEDGE (8.5%)
- **Type:** RWA, Basis Trades, Delta Neutral
- **Update:** Manual daily updates

### Gauntlet (Manual)
- **Products:** USD Alpha, Prime, Core vaults
- **Type:** Risk-managed institutional vaults
- **APY Range:** 6.8% - 9.2%

### Noon Capital (Manual)
- **Products:** USN, sUSN
- **Type:** Delta neutral, staked
- **APY Range:** 14.5% - 17.5%

### YieldFi (Manual)
- **Products:** yUSD, vyUSD
- **Type:** Multi-strategy professional management
- **APY Range:** 16% - 23.5%

### Avant Protocol (Manual)
- **Products:** avUSD, savUSD
- **Type:** Delta neutral strategies
- **APY Range:** 15.8% - 18.2%

### Gyroscope (Manual)
- **Products:** GYD, E-CLP
- **Type:** Superliquid stablecoin
- **APY Range:** 10.8% - 15.2%

## 🔐 Security Considerations

1. **Data Validation:** All APY values are validated to prevent display of erroneous data
2. **CORS Protection:** Backend implements CORS for secure cross-origin requests
3. **Rate Limiting:** Built-in caching prevents API abuse
4. **No Private Keys:** Dashboard is read-only; never handles user funds
5. **External Links:** All protocol links open in new tabs for security

## ⚠️ Disclaimers

**This tool is for informational purposes only:**

- APYs are subject to change and can be volatile
- Past performance does not guarantee future results
- Always conduct your own research (DYOR)
- DeFi protocols carry smart contract risks
- Never invest more than you can afford to lose
- Not financial advice

**Data Accuracy:**
- Data is aggregated from multiple sources
- Some protocols provide real-time data, others are updated manually
- Always verify APYs on the protocol's official website before investing

## 🛠️ Development

### Adding New Data Sources

1. Add the protocol to `mockYieldData` or create a new fetch function
2. Update the API integration in `server.js`
3. Add documentation to `API-INTEGRATION-GUIDE.md`
4. Update source badges and colors in the frontend

### Customizing the Dashboard

The dashboard is built with:
- **React** (via CDN) for reactive UI
- **Tailwind CSS** (via CDN) for styling
- **Vanilla JavaScript** for logic

To customize:
1. Edit the inline styles in `<style>` tags
2. Modify React components in `<script type="text/babel">`
3. Update Tailwind classes directly in JSX

### Running Tests

```bash
# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/yields
curl http://localhost:3000/api/yields/top?limit=5

# Test filtering
curl "http://localhost:3000/api/yields/filter?chain=Ethereum&minAPY=10"
```

## 📈 Future Enhancements

Potential improvements for future versions:

- [ ] Historical yield tracking and charts
- [ ] Price alerts for APY changes
- [ ] Portfolio tracking integration
- [ ] Risk scoring based on audits and TVL
- [ ] Mobile app versions
- [ ] WebSocket for real-time updates
- [ ] User authentication and favorites
- [ ] Advanced analytics and comparisons
- [ ] Integration with more protocols
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Resources

### Protocol Links
- [DeFi Llama](https://defillama.com/)
- [Midas](https://midas.app/)
- [Avant Protocol](https://www.avantprotocol.com/)
- [Noon Capital](https://noon.capital/)
- [YieldFi](https://yield.fi/)
- [Gauntlet](https://www.gauntlet.xyz/)
- [Pendle Finance](https://www.pendle.finance/)
- [Merkl](https://merkl.xyz/)
- [Gyroscope](https://www.gyro.finance/)

### Documentation
- [DeFi Llama API Docs](https://api-docs.defillama.com/)
- [Pendle API Docs](https://docs.pendle.finance/)
- [Merkl API Docs](https://docs.merkl.xyz/)

### Development Resources
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)

## 💬 Support

For questions, issues, or suggestions:
- Open an issue on the repository
- Review the API Integration Guide
- Check the inline code comments

## 🎯 Use Cases

This dashboard is perfect for:

- **DeFi Investors** - Finding the best stablecoin yields
- **Yield Farmers** - Comparing opportunities across protocols
- **Researchers** - Analyzing DeFi yield trends
- **Developers** - Building on top of aggregated data
- **Institutions** - Evaluating risk-adjusted returns

---

**Built with ❤️ for the DeFi community**

*Remember: Always DYOR and never invest more than you can afford to lose!*

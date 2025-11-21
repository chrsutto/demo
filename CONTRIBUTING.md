# Contributing to Stablecoin Yield Aggregator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🌟 Ways to Contribute

- **Add new data sources** - Integrate additional yield protocols
- **Improve UI/UX** - Enhance the dashboard design
- **Fix bugs** - Report and fix issues
- **Add features** - Implement new functionality
- **Update documentation** - Improve guides and docs
- **Write tests** - Add unit and integration tests

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/yourusername/stablecoin-yield-aggregator.git
   cd stablecoin-yield-aggregator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Test your changes**
   ```bash
   npm test
   ```

## 📝 Adding a New Data Source

To add a new protocol:

1. **Create a fetch function** in `server.js`:
   ```javascript
   async function fetchNewProtocol() {
     const response = await fetch('https://api.newprotocol.com/yields');
     const data = await response.json();
     return data.map(item => ({
       protocol: item.name,
       stablecoin: item.token,
       chain: item.chain,
       apy: item.apy,
       tvl: item.tvl,
       type: 'Lending', // or LP, RWA, etc.
       source: 'newprotocol',
       url: item.url,
       updatedAt: new Date().toISOString()
     }));
   }
   ```

2. **Add to aggregation** in the `getAllYields()` method

3. **Update mock data** in `stablecoin-yield-dashboard.html`

4. **Document the API** in `DATA-SOURCES-API-REFERENCE.md`

5. **Add tests** to verify the integration works

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Description** - Clear description of the bug
- **Steps to reproduce** - How to recreate the issue
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Screenshots** - If applicable
- **Environment** - Browser/Node version, OS, etc.

## 💡 Feature Requests

For feature requests, please:

1. Check if the feature already exists or is planned
2. Open an issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would be valuable

## 📋 Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation as needed

3. **Test thoroughly**
   ```bash
   npm test
   node test-apis.js
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add support for NewProtocol"
   # or
   git commit -m "fix: resolve APY calculation bug"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Formatting changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template
   - Submit for review

## ✅ Code Style

- **JavaScript**: Use ES6+ features
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Comments**: Use JSDoc for functions
- **Naming**: 
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_CASE for constants

Example:
```javascript
/**
 * Fetch yields from a DeFi protocol
 * @param {string} protocolName - Name of the protocol
 * @returns {Promise<Array>} Array of yield opportunities
 */
async function fetchProtocolYields(protocolName) {
  const API_BASE_URL = 'https://api.example.com';
  
  try {
    const response = await fetch(`${API_BASE_URL}/${protocolName}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${protocolName}:`, error);
    return [];
  }
}
```

## 🧪 Testing Guidelines

- Test all API integrations
- Verify data parsing and formatting
- Check error handling
- Test edge cases (no data, API failures, etc.)
- Ensure UI remains responsive

## 📚 Documentation

When adding features, update:

- `README.md` - Main documentation
- `API-INTEGRATION-GUIDE.md` - API integration steps
- `DATA-SOURCES-API-REFERENCE.md` - API endpoint details
- Inline code comments - For complex logic

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all external data
- Sanitize user inputs
- Report security issues privately

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

- Open an issue with the `question` label
- Check existing issues and documentation
- Review the API reference guide

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

---

**Happy coding!** 🚀

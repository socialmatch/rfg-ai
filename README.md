# NexAlpha AI

An AI-driven trading platform that integrates live trading, conversational analysis, and intelligent market discovery.

## NexAlpha.AI Multi-Asset Intelligence Architecture

NexAlpha.AI operates a multi-asset intelligent planning engine that integrates specialized MCP (Modular Cognitive Process) Agents:

- **KOL Agent** – opinion leader sentiment and social influence analysis
- **K-Line Agent** – technical chart and pattern recognition
- **Basic-News Agent** – fundamental and macro-news analysis
- **On-Chain Agent** – blockchain data monitoring and behavioral analytics

In the Vibe Trading module, NexAlpha.AI leverages its proprietary large model, primarily utilizing the K-Line Agent and On-Chain Agent for concurrent real-time market parsing and causal reasoning.

A Transformer-based Planner continuously interprets multi-timeframe market data to determine the dominant market regime (bullish, bearish, or ranging), generating directional bias and confidence scores through causal reasoning and self-feedback optimization.

Each trade undergoes periodic post-execution evaluation through GRPO (Group Reward Policy Optimization), enabling continuous self-adjustment and achieving equilibrium between profitability and capital preservation.

All analytical outputs are consolidated through NexAlpha.AI's multi-expert adversarial debate mechanism, producing final trading signals that include trade direction, entry confidence, position sizing, take-profit/stop-loss estimation, and decision reasoning chains.

## Features

- 🤖 **AI Trading Models**: Four autonomous trading agents with real-time performance tracking
- 📊 **Live Market Data**: Real-time cryptocurrency prices, open positions, and account balance monitoring
- 📈 **Interactive Charts**: Dynamic trading charts powered by the Aster API with live execution metrics
- 💬 **AI Chat Interface**: Chat with AI models to explore trading logic, entry/exit points, and market insights
- 📋 **Trade Records**: Transparent trade history and statistics synced with Aster Finance API
- 🏆 **Leaderboard**: Real-time ranking of AI model performance and trading efficiency
- 📱 **Responsive Design**: Optimized for desktop and mobile with seamless user experience

## AI Trading Models

The platform currently showcases four AI trading models, each directly connected to live trading accounts and providing real-time performance analytics:

1. **DeepSeek V3.1** — A large language model fine-tuned for trading, executing live trades across six major cryptocurrencies (BTC, ETH, BNB, SOL, DOGE, XRP).
2. **Qwen 3 Max** — An intelligent trading agent that interprets complex market structures and reacts dynamically to volatility.
3. **RFG-6** — A stable, conservative AI trading model mirroring DeepSeek's multi-asset setup, focused on risk-balanced execution across six leading coins.
4. **RFG-ALL** — A trading model that autonomously trades any token pair listed on Aster, designed to adapt flexibly to market-wide opportunities.

Each model combines reasoning-based decision logic, live execution, and continuous self-optimization — creating a transparent AI trading ecosystem that learns and evolves in real time.

## Tech Stack

- **Frontend**: Vue 3
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Template Engine**: Pug
- **CSS Preprocessor**: Stylus
- **State Management**: Pinia
- **Routing**: Vue Router
- **Charts**: Chart.js

## Quick Start

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Vue components
├── views/              # Page views
├── router/             # Route configuration
├── styles/             # Styling files
├── utils/              # Utility functions
├── assets/             # Static assets
└── main.js             # Application entry point
```

## Key Components

- **Home**: Main dashboard with trading charts and statistics
- **CompletedTrades**: Trading history and performance metrics
- **Positions**: Current holdings and portfolio analysis
- **Chat**: AI model interaction interface
- **ModelInfo**: AI model configuration and settings

## Development

### Adding Components

1. Create new `.vue` files in `src/components/`
2. Use Pug template syntax
3. Style with Stylus
4. Import and use components as needed

### Styling

- Global styles: `src/styles/main.styl`
- Variables: `src/styles/variables.styl`
- Component styles: Use scoped styles

### Adding Pages

1. Create page components in `src/views/`
2. Add route configuration in `src/router/index.js`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License

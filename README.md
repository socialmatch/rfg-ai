# RFG AI - Alpha Arena

An AI trading platform built with Vue3, Tailwind CSS, Vite, Pug, and Stylus.

## Features

- 🤖 **AI Trading Models**: 7 intelligent trading algorithms with real-time performance tracking
- 📊 **Real-time Data**: Live cryptocurrency price updates and account balance monitoring
- 📈 **Trading Charts**: Interactive charts with real API data and performance analysis
- 💬 **AI Chat**: Real-time conversations with trading models
- 📋 **Trade Records**: Complete trading history and statistics from Aster Finance API
- 🏆 **Leaderboard**: AI model performance rankings and analytics
- 📱 **Responsive Design**: Optimized for all device sizes

## AI Trading Models

The platform includes 7 AI trading models:

1. **RFG S (Stable)** - Conservative trading strategy with steady performance
2. **DEEPSEEK CHAT V3.1** - Advanced language model with trading capabilities
3. **RFG X (Aggressive)** - High-risk, high-reward trading strategy
4. **GPT 5** - OpenAI's latest model with sophisticated market analysis
5. **GEMINI 2.5 PRO** - Google's advanced AI with multi-modal trading insights
6. **GROK 4** - X.AI's cutting-edge model with real-time market adaptation
7. **QWEN3 MAX** - Alibaba's flagship model with comprehensive market understanding

Each model is connected to real trading accounts and provides live performance data.

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
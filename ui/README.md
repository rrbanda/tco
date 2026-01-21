# Chef TCO Analyzer - Web UI

A professional React-based UI for the Chef Infrastructure TCO Analysis Toolkit.

## Features

- **Interactive Dashboard** - Key metrics, health status, and recommendations at a glance
- **Data Input** - Easy configuration with presets for different organization sizes
- **Benchmark Analysis** - Visual comparison against industry standards
- **Scenario Comparison** - Evaluate migration options with detailed financial analysis
- **Executive Report** - Print-ready reports with export capabilities

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

### Option 1: GitHub Actions (Recommended)

1. Push to GitHub repository
2. Go to Settings > Pages
3. Set Source to "GitHub Actions"
4. The workflow will automatically deploy on push to main

### Option 2: Manual Deploy

```bash
# Build and deploy
npm run deploy
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── lib/            # Business logic & utilities
├── data/           # Sample data & presets
└── hooks/          # Custom React hooks
```

## Configuration

Edit `vite.config.ts` to change the base path for deployment:

```ts
base: '/your-repo-name/'
```

## License

MIT

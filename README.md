# Nexus Query Optimizer A/B Test Dashboard

A React + Tailwind CSS dashboard visualizing A/B test results for the Nexus Query Optimizer.

## Features

- **Dark Mode Design** - Carefully crafted dark theme with oklch color palette
- **KPI Cards** - High-level metrics at a glance
- **Interactive Charts** - Zero-result rate comparison, average results per query, entity distribution
- **Detailed Tables** - Treatment group queries and content gap analysis
- **Head-to-Head Comparison** - Visual comparison of treatment vs control results
- **Responsive Layout** - Works on mobile, tablet, and desktop

## Tech Stack

- React 18
- Tailwind CSS 3
- Recharts (data visualization)
- Lucide React (icons)
- Vite (build tool)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

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

## Project Structure

```
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── src/
    ├── main.jsx        # React entry point
    ├── index.css       # Global styles
    └── Dashboard.jsx   # Main dashboard component
```

## Color Palette

| Color | OKLCH | Hex |
|-------|-------|-----|
| Background | oklch(0.129 0.042 264.695) | #0f0f1a |
| Surface | oklch(0.208 0.042 265.755) | #1a1a2e |
| Text Primary | oklch(0.984 0.003 247.858) | #fafafa |
| Text Muted | oklch(0.704 0.04 256.788) | #9ca3af |
| Purple | oklch(0.488 0.243 264.376) | - |
| Cyan | oklch(0.696 0.17 162.48) | - |
| Orange | oklch(0.769 0.188 70.08) | - |
| Pink | oklch(0.627 0.265 303.9) | - |
| Red | oklch(0.645 0.246 16.439) | - |

## License

MIT


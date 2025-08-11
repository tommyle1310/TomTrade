# TomTrade Admin Dashboard

A beautiful, modern admin dashboard for managing the TomTrade trading system, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### 🎨 Beautiful Design

- **Modern UI/UX**: Clean, professional design inspired by premium trading dashboards
- **Responsive Layout**: Fully responsive design that works on all devices
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Smooth Animations**: Hover effects and transitions for enhanced user experience

### 📊 Admin-Focused Metrics

- **System Overview**: Total users, active trades, total volume, system uptime
- **Trading Analytics**: Win ratio, profit factor, average win/loss, best trades
- **System Status**: Real-time monitoring of all trading system components
- **Performance Tracking**: System performance charts and metrics

### 🧭 Navigation & Organization

- **Left Sidebar**: Organized navigation with clear sections for different admin functions
- **Quick Actions**: Easy access to system settings, performance reports, and notifications
- **Status Indicators**: Visual status indicators for system health and performance

### 🔧 Technical Features

- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Lucide Icons**: Beautiful, consistent iconography throughout the interface
- **Component Architecture**: Modular, reusable components for easy maintenance

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

# Start production server
npm start
```

### Development

The dashboard is built with a component-based architecture:

- `AdminDashboard.tsx` - Main dashboard component
- `globals.css` - Global styles and CSS variables
- Responsive grid layout with Tailwind CSS
- Custom CSS variables for consistent theming

## Dashboard Sections

### 1. System Overview

- **Total Users**: Current registered user count
- **Active Trades**: Number of currently open trades
- **Total Volume**: Overall trading volume across the platform
- **System Uptime**: Platform reliability metrics

### 2. Trading Analytics

- **Win Ratio**: Percentage of profitable trades
- **Profit Factor**: Risk-adjusted performance metric
- **Average Win/Loss**: Statistical trading performance
- **Best Trade**: Highest single trade profit

### 3. System Status

- **Order Matching Engine**: Core trading engine health
- **Market Data Feed**: Real-time data connectivity
- **User Authentication**: Security system status
- **Risk Management**: Risk control systems
- **Notification System**: Alert system status

### 4. Recent Activities

- **System Alerts**: Important system notifications
- **User Actions**: Admin activity tracking
- **Maintenance**: Scheduled system updates
- **Performance**: System performance events

### 5. Top Trading Pairs

- **Volume Analysis**: Most traded currency pairs
- **Performance Tracking**: Pair-specific metrics
- **Trend Analysis**: Performance changes over time

## Customization

### Colors & Theming

The dashboard uses CSS custom properties for easy theming:

```css
:root {
  --primary-blue: #3b82f6;
  --primary-green: #10b981;
  --primary-red: #ef4444;
  --card-bg: #ffffff;
  --text-primary: #1f2937;
}
```

### Adding New Metrics

To add new metrics, simply extend the data objects in `AdminDashboard.tsx`:

```typescript
const newMetrics = {
  newMetric: 'Value',
  // ... more metrics
};
```

### Responsive Design

The dashboard is built with a mobile-first approach using Tailwind CSS breakpoints:

- `sm:` - Small devices (640px+)
- `md:` - Medium devices (768px+)
- `lg:` - Large devices (1024px+)
- `xl:` - Extra large devices (1280px+)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the TomTrade trading system.

# Theme System Documentation

A comprehensive design system for React Native applications with consistent styling, typography, spacing, and component patterns.

## 📁 Structure

```
theme/
├── index.ts          # Main theme export and utilities
├── colors.ts         # Color palette and semantic colors
├── typography.ts     # Font styles, sizes, and text variants
├── spacing.ts        # Spacing scale, layout, shadows, and borders
├── animations.ts     # Animation presets and timing functions
├── breakpoints.ts    # Responsive design utilities
├── components.ts     # Pre-styled component themes
└── README.md         # This documentation
```

## 🎨 Colors

### Usage

```typescript
import { colors, palette } from '../theme';

// Semantic colors (recommended)
backgroundColor: colors.primary,
color: colors.text.primary,

// Direct palette access
backgroundColor: palette.coral[500],
```

### Color Categories

- **Primary**: Brand colors (coral theme)
- **Background**: Surface and overlay colors
- **Text**: Primary, secondary, tertiary text colors
- **Border**: Border and divider colors
- **Status**: Success, warning, error, info colors
- **Interactive**: Button and interactive element colors

## ✍️ Typography

### Usage

```typescript
import { typography, fontSize } from '../theme';

// Typography variants (recommended)
style={typography.heading.h1}
style={typography.body.medium}

// Direct font properties
fontSize: fontSize.lg,
```

### Typography Scale

- **Display**: Large hero text
- **Heading**: H1-H6 heading styles
- **Body**: Regular text content
- **Label**: Form labels and UI text
- **Caption**: Small descriptive text
- **Button**: Button text styles

## 📏 Spacing

### Usage

```typescript
import { spacing, layout, shadows } from '../theme';

// Spacing scale
padding: spacing[4], // 16px
margin: spacing[2],  // 8px

// Layout presets
...layout.screen,
...layout.card,

// Shadows
...shadows.base,
```

### Spacing Scale

Based on 4px increments: `0, 2, 4, 6, 8, 12, 16, 20, 24...`

## 🎬 Animations

### Usage

```typescript
import { animations, duration, easing } from '../theme';

// Animation presets
Animated.timing(fadeAnim, {
  ...animations.fadeIn,
}).start();

// Custom animations
Animated.timing(value, {
  duration: duration.normal,
  easing: easing.smooth,
}).start();
```

## 📱 Responsive Design

### Usage

```typescript
import { responsive, deviceType } from '../theme';

// Responsive values
const padding = responsive.getValue(
  {
    xs: 12,
    md: 24,
    lg: 32,
  },
  16
);

// Device detection
if (deviceType.isTablet) {
  // Tablet-specific styles
}
```

## 🧩 Component Themes

### Usage

```typescript
import { theme } from '../theme';

// Use component themes
<View style={theme.components.card.base}>
  <Text style={theme.components.card.title}>Title</Text>
</View>

// Button variants
<TouchableOpacity style={[
  theme.components.button.base,
  theme.components.button.variants.primary,
  theme.components.button.sizes.medium,
]}>
  <Text style={theme.components.button.text.primary}>
    Button
  </Text>
</TouchableOpacity>
```

## 🛠 Theme Utilities

### Usage

```typescript
import { themeUtils } from '../theme';

// Color with opacity
const semiTransparent = themeUtils.getColorWithOpacity('#FF6B6B', 0.5);

// Responsive styles
const responsiveStyle = themeUtils.createResponsiveStyle(
  {
    xs: { fontSize: 14 },
    md: { fontSize: 18 },
  },
  { fontSize: 16 }
);

// Merge styles
const combinedStyle = themeUtils.mergeStyles(
  baseStyle,
  variantStyle,
  conditionalStyle
);
```

## 🎯 Best Practices

### 1. Use Semantic Colors

```typescript
// ✅ Good - semantic meaning
color: colors.text.primary,
backgroundColor: colors.surface.elevated,

// ❌ Avoid - direct palette access
color: palette.gray[900],
backgroundColor: palette.white,
```

### 2. Use Typography Variants

```typescript
// ✅ Good - consistent typography
style={typography.heading.h2}

// ❌ Avoid - custom font styles
style={{ fontSize: 24, fontWeight: 'bold' }}
```

### 3. Use Spacing Scale

```typescript
// ✅ Good - consistent spacing
padding: spacing[4],
margin: spacing[2],

// ❌ Avoid - arbitrary values
padding: 17,
margin: 9,
```

### 4. Use Component Themes

```typescript
// ✅ Good - consistent components
style={[
  theme.components.button.base,
  theme.components.button.variants.primary
]}

// ❌ Avoid - custom component styles
style={{
  backgroundColor: '#FF6B6B',
  padding: 12,
  borderRadius: 8,
}}
```

## 🔧 Customization

### Extending Colors

```typescript
// In colors.ts
export const customColors = {
  ...colors,
  brand: {
    primary: '#your-color',
    secondary: '#your-color',
  },
};
```

### Adding Component Themes

```typescript
// In components.ts
export const customComponent = {
  base: {
    // Base styles
  },
  variants: {
    // Component variants
  },
};
```

## 📖 Examples

### Complete Button Component

```typescript
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  children: string;
  onPress: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        theme.components.button.base,
        theme.components.button.variants[variant],
        theme.components.button.sizes[size],
      ]}
      onPress={onPress}
    >
      <Text style={theme.components.button.text[variant]}>{children}</Text>
    </TouchableOpacity>
  );
};
```

### Responsive Card Component

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../theme';

export const Card: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const responsivePadding = theme.responsive.getValue(
    {
      xs: theme.spacing[3],
      md: theme.spacing[6],
    },
    theme.spacing[4]
  );

  return (
    <View style={[theme.components.card.base, { padding: responsivePadding }]}>
      <Text style={theme.components.card.title}>{title}</Text>
      <View style={theme.components.card.body}>{children}</View>
    </View>
  );
};
```

## 🚀 Getting Started

1. Import the theme in your components:

```typescript
import { theme } from '../theme';
```

2. Use semantic colors and typography:

```typescript
<Text
  style={[theme.typography.heading.h1, { color: theme.colors.text.primary }]}
>
  Hello World
</Text>
```

3. Apply consistent spacing:

```typescript
<View style={{
  padding: theme.spacing[4],
  margin: theme.spacing[2],
}}>
```

4. Use component themes for consistency:

```typescript
<View style={theme.components.card.base}>
  <Text style={theme.components.card.title}>Card Title</Text>
</View>
```

This theme system ensures consistency, maintainability, and scalability across your entire React Native application! 🎉

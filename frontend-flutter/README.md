# TomTrade Flutter App

This is a Flutter version of the TomTrade React Native app, converted from the original React Native codebase.

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── navigation/
│   └── app_navigator.dart    # Main navigation with bottom tabs
├── screens/
│   ├── home_screen.dart      # Home screen
│   ├── like_screen.dart      # Like/Favorites screen
│   ├── settings_screen.dart  # Settings screen
│   └── search_screen.dart    # Search screen
└── widgets/
    └── floating_tab_bar.dart # Custom floating tab bar widget

assets/                       # App assets (icons, images)
```

## Features Converted

- ✅ Bottom tab navigation with 4 screens
- ✅ Custom floating tab bar with animations and shadows
- ✅ Material Design 3 theming
- ✅ Responsive design
- ✅ All original screens (Home, Like, Settings, Search)
- ✅ Assets integration

## Key Conversions

### React Native → Flutter Equivalents

| React Native        | Flutter                      |
| ------------------- | ---------------------------- |
| `View`              | `Container`, `Column`, `Row` |
| `Text`              | `Text`                       |
| `TouchableOpacity`  | `GestureDetector`, `InkWell` |
| `StyleSheet`        | Widget properties            |
| `@react-navigation` | Built-in navigation          |
| `Ionicons`          | `Icons` (Material Icons)     |

### Custom Components

- **FloatingTabBar**: Converted from React Native custom tab bar with shadows, animations, and floating title
- **Navigation**: Uses `IndexedStack` for efficient screen switching
- **Theming**: Material Design 3 with custom color scheme

## Running the App

1. Ensure Flutter is installed
2. Run `flutter pub get` to install dependencies
3. Run `flutter run` to start the app

## Original React Native Features

The original React Native app included:

- Expo-based React Native app
- Custom floating tab bar with dynamic title positioning
- Bottom tab navigation
- Four main screens with consistent styling
- Material icons integration

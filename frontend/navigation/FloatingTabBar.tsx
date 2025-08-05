import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, color }) => (
  <Ionicons 
    name={name} 
    size={24} 
    color={color}
    style={{ opacity: focused ? 1 : 0.6 }}
  />
);

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'Home':
        return 'home';
      case 'Like':
        return 'heart';
      case 'Settings':
        return 'settings';
      case 'Search':
        return 'search';
      default:
        return 'home';
    }
  };

  const activeRoute = state.routes[state.index];
  const activeLabel = typeof descriptors[activeRoute.key].options.tabBarLabel === 'string'
    ? descriptors[activeRoute.key].options.tabBarLabel 
    : typeof descriptors[activeRoute.key].options.title === 'string'
    ? descriptors[activeRoute.key].options.title 
    : activeRoute.name;

  // Show title for 3 seconds when tab changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Fade in the title
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Set timeout to fade out after 3 seconds
    timeoutRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1500);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.index, fadeAnim]); // Trigger when active tab changes

  return (
    <View style={styles.container}>
      {/* Title above container - centered horizontally */}
      <Animated.View style={[
        styles.titleContainer, 
        { 
          opacity: fadeAnim,
          top: -16, // Position above the container
          alignSelf: 'center', // Center horizontally
        }
      ]}>
        <Text style={styles.titleText}>{String(activeLabel)}</Text>
      </Animated.View>
      
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined 
            ? options.tabBarLabel 
            : options.title !== undefined 
            ? options.title 
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tab,
                isFocused && styles.activeTab
              ]}
            >
              <TabIcon
                name={getIconName(route.name)}
                focused={isFocused}
                color={isFocused ? 'white' : '#8E8E93'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C3AED',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // Transparent container
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 8, // Space between tab items
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 60,
    backgroundColor: 'white', // Each tab has white background
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeTab: {
    backgroundColor: '#7C3AED', // Active tab has the blue violet background
  },
});
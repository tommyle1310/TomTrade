import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface AvatarProps {
  source?: string;
  fallback?: string;
  size?: number;
  style?: any;
  textStyle?: any;
}

export default function Avatar({ 
  source, 
  fallback, 
  size = 40, 
  style, 
  textStyle 
}: AvatarProps) {
  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.avatar, avatarStyle, style]}
      />
    );
  }

  // Fallback to initials or default
  const initials = fallback 
    ? fallback.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[styles.fallbackAvatar, avatarStyle, style]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.4 }, textStyle]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: theme.colors.background.secondary,
  },
  fallbackAvatar: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

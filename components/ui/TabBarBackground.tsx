import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';

export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="systemChromeMaterial"
        intensity={100}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return null;
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  return Platform.OS === 'ios' ? tabHeight : 0;
}
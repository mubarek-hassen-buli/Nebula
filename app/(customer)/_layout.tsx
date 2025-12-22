import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function CustomerLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

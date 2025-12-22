import { StyleSheet, Text, View } from 'react-native';

export default function CustomerHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Customer Home Screen</Text>
      <Text style={styles.subtitle}>Restaurant list will go here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
});

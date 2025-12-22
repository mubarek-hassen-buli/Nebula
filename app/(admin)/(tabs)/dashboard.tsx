import { StyleSheet, Text, View } from 'react-native';

export default function AdminDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Admin overview will go here</Text>
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

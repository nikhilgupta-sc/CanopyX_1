import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import storage from './storage';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      const h = await storage.getHistory();
      setHistory(h.reverse());
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Past Surveys</Text>
      <FlatList
        data={history}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.score}>Score: {item.score}/500</Text>
            <Text style={styles.co2}>CO₂: {item.totalCo2.toFixed(1)} g</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { fontSize: 24, fontWeight: '600', margin: 20, color: '#2E2E2E' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3
  },
  date: { fontSize: 14, color: '#666' },
  score: { fontSize: 16, fontWeight: '500', color: '#4CAF50', marginTop: 5 },
  co2: { fontSize: 14, color: '#333', marginTop: 3 }
});
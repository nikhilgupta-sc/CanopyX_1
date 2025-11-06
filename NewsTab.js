import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const newsArticles = [
  {
    id: 1,
    title: 'NASA: 2024 Warmest Year on Record',
    source: 'NASA',
    url: 'https://climate.nasa.gov/news/'
  },
  {
    id: 2,
    title: 'Renewables Hit 30% of Global Power',
    source: 'IEA',
    url: 'https://www.iea.org/news/'
  },
  {
    id: 3,
    title: 'Youth Climate Ruling',
    source: 'Climate News',
    url: 'https://climatenewsnetwork.net/'
  },
  {
    id: 4,
    title: 'EV Sales Soar Worldwide',
    source: 'Clean Energy Wire',
    url: 'https://www.cleanenergywire.org/'
  },
  {
    id: 5,
    title: 'Direct Air Capture Advances',
    source: 'Science Daily',
    url: 'https://www.sciencedaily.com/news/earth_climate/'
  }
];

export default function NewsTab() {
  const openLink = async (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {newsArticles.map(n => (
          <TouchableOpacity
            key={n.id}
            style={styles.card}
            onPress={() => openLink(n.url)}
          >
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.source}>{n.source}</Text>
            <Ionicons name="open-outline" size={16} color="#4CAF50" style={{ marginTop: 8 }} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 20 },
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
  title: { fontSize: 16, fontWeight: '600', color: '#2E2E2E' },
  source: { fontSize: 12, color: '#4CAF50', marginTop: 4 }
});
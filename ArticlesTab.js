import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const articles = [
  {
    id: 1,
    title: 'How Climate Change Happens',
    summary: 'Learn about greenhouse effect and human impact.',
    content: `Climate change happens when extra greenhouse gases trap heat.\n\nGreenhouse gases (CO₂, methane) let sunlight in but block heat from escaping.\n\nSince 1800s we burn fossil fuels, adding CO₂, making Earth warmer.`
  },
  {
    id: 2,
    title: 'Impact of Climate Change',
    summary: 'Effects on weather, oceans, and ecosystems.',
    content: `Rising temperatures cause:\n• Stronger storms\n• More droughts\n• Sea level rise (melting ice)\n\nAnimals lose habitats, coral reefs bleach, and weather disasters become worse.`
  },
  {
    id: 3,
    title: 'What Causes Climate Change',
    summary: 'The main sources of greenhouse gas emissions.',
    content: `Major causes:\n• Burning coal, oil, and gas (75%)\n• Agriculture and livestock (24%)\n• Deforestation\n\nFossil fuels release CO₂. Cows produce methane. Cutting trees reduces CO₂ absorption.`
  },
  {
    id: 4,
    title: 'What You Can Do',
    summary: 'Everyday actions to reduce your footprint.',
    content: `Actions you can take:\n• Use LED bulbs and unplug devices\n• Take shorter showers\n• Walk, bike, or use public transit\n• Eat less meat\n• Recycle and compost\n\nSmall steps add up when millions participate!`
  }
];

export default function ArticlesTab({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {articles.map(a => (
          <TouchableOpacity
            key={a.id}
            style={styles.card}
            onPress={() => navigation.navigate('ArticleView', { article: a })}
          >
            <Text style={styles.title}>{a.title}</Text>
            <Text style={styles.summary}>{a.summary}</Text>
            <View style={styles.readMore}>
              <Text style={styles.readMoreText}>Read More</Text>
              <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
            </View>
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
  title: { fontSize: 18, fontWeight: '600', color: '#2E2E2E', marginBottom: 8 },
  summary: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  readMore: { flexDirection: 'row', alignItems: 'center' },
  readMoreText: { color: '#4CAF50', fontWeight: '500', marginRight: 4 }
});
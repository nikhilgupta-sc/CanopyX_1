import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';

const ARTICLES = [
  {
    id: '1',
    firestoreId: 'How_Does_Climate_Change_Happen', // The ID you used in Google Docs script
    title: 'How Climate Change Happens',
    description: 'Understand the science behind Climate Change.',
    category: 'Science'
  },
  {
    id: '2',
    firestoreId: 'What_Releases_Carbon_Dioxide', // The ID you used in Google Docs script
    title: 'What Releases Greenhouse Gases?',
    description: 'Understand the fundamental contributors to Greenhouse Gases.',
    category: 'Science'
  },
  {
    id: '3',
    firestoreId: 'Effects_Of_Climate_Change', // The ID you used in Google Docs script
    title: 'Effects Of Climate Change',
    description: 'Understand the effects of Climate Change.',
    category: 'Science'
  },
  {
    id: '4',
    firestoreId: 'What_Can_You_Do_About_Climate_Change', // The ID you used in Google Docs script
    title: 'What Can You Do About Climate Change',
    description: 'Understand how you can solve Climate Change',
    category: 'Impact'
  },
  // Add more articles here
];

const ArticlesTab = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ArticleDetail', { docId: item.firestoreId, title: item.title })}
    >
     
      <View style={styles.cardContent}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Explore Articles</Text>
      <FlatList
        data={ARTICLES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1B4332', padding: 20, marginBottom: -10, fontFamily: 'Quicksand-Bold' },
  listContainer: { padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  
  },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  category: { color: '#2D6A4F', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginBottom: 5, fontFamily:'Quicksand-Medium' },
  title: { fontSize: 18, fontWeight: '700', color: '#1B4332', marginBottom: 5, fontFamily: 'Quicksand-Bold' },
  description: { fontSize: 14, color: '#666', lineHeight: 20, fontFamily: 'Quicksand-Medium' },
});

export default ArticlesTab;
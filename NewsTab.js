import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Modal, 
  SafeAreaView 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; // Make sure this points to your config

const NewsTab = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState(null); // Controls the WebView Modal

  // 1. Listen to Firestore for the latest 8 links
  useEffect(() => {
    const q = query(
      collection(db, 'ClimateNews'), // We'll create this collection next
      orderBy('date', 'desc'),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNews(articles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => setSelectedUrl(item.url)} // Opens the WebView
      activeOpacity={0.8}
    >
      <View style={styles.textContainer}>
        <Text style={styles.source}>{item.source.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#2D6A4F" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Latest News</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#2D6A4F" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 2. IN-APP BROWSER (WebView Modal) */}
      <Modal 
        visible={selectedUrl !== null} 
        animationType="slide" 
        presentationStyle="pageSheet" // Looks great on iOS
        onRequestClose={() => setSelectedUrl(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedUrl(null)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.browserTitle}>Reading Article</Text>
          </View>
          
          {selectedUrl && (
            <WebView 
              source={{ uri: selectedUrl }} 
              startInLoadingState={true}
              renderLoading={() => <ActivityIndicator size="large" color="#2D6A4F" style={{position:'absolute', top: '50%', left: '45%'}}/>}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6', paddingTop: 60 },
  header: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: '#1B4332',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  textContainer: { flex: 1, paddingRight: 10 },
  source: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#2D6A4F',
    marginBottom: 5,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  date: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#999',
  },
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#FFF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeBtn: { padding: 5 },
  closeText: { fontFamily: 'Quicksand-Bold', fontSize: 16, color: '#007AFF' },
  browserTitle: { fontFamily: 'Quicksand-Medium', fontSize: 14, color: '#333' }
});

export default NewsTab;
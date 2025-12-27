import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  useWindowDimensions, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from './firebase'; 
import { Ionicons } from '@expo/vector-icons';

const ArticleDetailScreen = ({ route, navigation }) => {
  const { docId, title } = route.params;
  const { width } = useWindowDimensions();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: Make sure 'Content' matches your Firestore collection name exactly
    const docRef = doc(db, 'Content', docId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setContent(snapshot.data().contentBody);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [docId]);

const tagsStyles = {
  body: {
    fontFamily: 'Quicksand-Medium',
    color: '#333',
    // We leave fontSize and lineHeight out so Google Docs handles them
  },
  b: { 
    fontFamily: 'Quicksand-Bold' 
  },
  strong: { 
    fontFamily: 'Quicksand-Bold' 
  },
  p: { 
    // This ensures the spacing between paragraph blocks is consistent
    marginBottom: 30, 
  },
  img: { 
    marginVertical: 15, 
    borderRadius: 10 
  },
  span: { 
    fontFamily: 'Quicksand-Medium',
    // No fixed lineHeight here; it inherits the 'line-height: 2' from the script
  }
};

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#2D6A4F" /></View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#1B4332" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>

      {/* SCROLLABLE CONTENT */}
      {/* Important: flex: 1 here allows the ScrollView to take up the remaining space */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContent}
        bounces={true}
      >
        {content ? (
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: content }}
            tagsStyles={tagsStyles}
            systemFonts={['Quicksand-Medium', 'Quicksand-Bold']}
          />
        ) : (
          <Text style={styles.errorText}>No content found.</Text>
        )}
        
        {/* Adds extra space at the bottom so the last line isn't cut off */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeButton: { 
    padding: 5 
  },
  headerTitle: { 
    flex: 1, 
    fontSize: 18, 
    fontFamily: 'Quicksand-Bold', 
    color: '#1B4332',
    marginLeft: 10 
  },
  scrollContent: { 
    padding: 20 
  },
  errorText: { 
    textAlign: 'center', 
    marginTop: 50, 
    fontFamily: 'Quicksand-Medium',
    color: '#666'
  }
});

export default ArticleDetailScreen;
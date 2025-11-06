import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getSurveyHistory, getLatestSurvey, loadData } from './storage';
import { useAuth } from './contexts/AuthContext'; // Import Firebase Auth context

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [latestSurvey, setLatestSurvey] = useState(null);
  const [surveyHistory, setSurveyHistory] = useState([]);
  const { user, signOut } = useAuth(); // Get user from Firebase Auth

  useEffect(() => {
    loadUserData();
  }, [user]); // Reload when user changes

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSurveyData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      // Get user name from Firebase Auth
      if (user) {
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      } else {
        // Fallback to local storage if Firebase user not available
        const userData = await loadData('userData');
        if (userData) {
          setUserName(userData.name || 'User');
        }
      }
      loadSurveyData();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSurveyData = async () => {
    try {
      const history = await getSurveyHistory();
      const latest = await getLatestSurvey();
      setSurveyHistory(history);
      setLatestSurvey(latest);
    } catch (error) {
      console.error('Error loading survey data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled by auth state change in App.js
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Failed', 'Unable to sign out. Please try again.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 400) return '#22C55E';
    if (score >= 300) return '#84CC16';
    if (score >= 200) return '#EAB308';
    if (score >= 100) return '#F97316';
    if (score === "----") return '#000000';
    return '#EF4444';
  };

  const getScoreRating = (score) => {
    if (score >= 400) return 'Climate Hero! 🌟';
    if (score >= 300) return 'Eco Champion! 🌱';
    if (score >= 200) return 'Earth Friend 🌍';
    if (score >= 100) return 'Getting Better 📈';
    if (score === "----") return 'Fill out a survey to get a score';
    return 'Room to Grow 🌱';
  };

  const renderChart = () => {
    if (surveyHistory.length < 2) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            Take more surveys to see your progress! 📈
          </Text>
        </View>
      );
    }

    const recentHistory = surveyHistory.slice(-6).reverse();
    const chartData = {
      labels: recentHistory.map((_, index) => `S${index + 1}`),
      datasets: [
        {
          data: recentHistory.map(entry => entry.score),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: new Array(recentHistory.length).fill(250),
          color: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
          strokeWidth: 2,
          withDots: false,
        }
      ]
    };

    return (
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={180}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "5", strokeWidth: "2" }
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  const currentScore = String(latestSurvey?.score || "----");
  const currentCO2 = String(latestSurvey?.totalCO2 || "---- ");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with user info and logout */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello, {userName}! 👋</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Climate Summary</Text>
        
        {/* Current Score Display */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreLabel}>Your Climate Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(currentScore) }]}>
              {currentScore}
            </Text>
            <Text style={styles.scoreSubtext}>Out of 500</Text>
            <Text style={[styles.scoreRating, { color: getScoreColor(currentScore) }]}>
              {getScoreRating(currentScore)}
            </Text>
          </View>
          
          <View style={styles.co2Display}>
            <Text style={styles.co2Label}>Weekly CO₂</Text>
            <Text style={styles.co2Value}>{currentCO2}g</Text>
            <Text style={styles.co2Daily}>
              {currentCO2 !== "---- " ? `${(parseInt(currentCO2) / 7).toFixed(0)}g/day` : 'No data'}
            </Text>
          </View>
        </View>

        {/* Progress Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
          {renderChart()}
          <Text style={styles.chartNote}>Gray line shows world average (250)</Text>
        </View>

        {/* Quick Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌱 Daily Climate Tips</Text>
          <Text style={styles.tipText}>• Walk or bike for short trips instead of driving</Text>
          <Text style={styles.tipText}>• Turn off electronics when not in use</Text>
          <Text style={styles.tipText}>• Take shorter showers to save water and energy</Text>
          <Text style={styles.tipText}>• Use reusable bags and water bottles</Text>
        </View>

        {/* Survey Call to Action */}
        <TouchableOpacity 
          style={styles.surveyButton}
          onPress={() => navigation.navigate('Survey')}
        >
          <Text style={styles.surveyButtonText}>📋 Take Weekly Survey</Text>
        </TouchableOpacity>

        {/* Quick Navigation */}
        <View style={styles.quickNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Impact')}
          >
            <Text style={styles.navButtonEmoji}>🎯</Text>
            <Text style={styles.navButtonText}>View Full Impact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Lessons')}
          >
            <Text style={styles.navButtonEmoji}>📚</Text>
            <Text style={styles.navButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'Quicksand-SemiBold',
    color: '#1B4332',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Quicksand-Bold',
    marginBottom: 5,
  },
  scoreSubtext: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
  },
  scoreRating: {
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
    marginTop: 5,
    textAlign: 'center',
  },
  co2Display: {
    alignItems: 'center',
    flex: 1,
  },
  co2Label: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    marginBottom: 5,
  },
  co2Value: {
    fontSize: 32,
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
  },
  co2Daily: {
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand-SemiBold',
    color: '#1B4332',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  chartNote: {
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  tipText: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  surveyButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  surveyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Quicksand-SemiBold',
  },
  quickNav: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
    color: '#374151',
    textAlign: 'center',
  },
});
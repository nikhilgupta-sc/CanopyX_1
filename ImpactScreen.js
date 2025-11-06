import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getSurveyHistory, getLatestSurvey, loadData } from './storage';

const screenWidth = Dimensions.get('window').width;

// Relatable carbon comparisons
const CARBON_COMPARISONS = [
  { activity: 'driving a gasoline car', co2PerUnit: 400, unit: 'miles', emoji: '🚗' },
  { activity: 'charging your smartphone', co2PerUnit: 8, unit: 'charges', emoji: '📱' },
  { activity: 'watching TV', co2PerUnit: 56, unit: 'hours', emoji: '📺' },
  { activity: 'taking a bath', co2PerUnit: 1600, unit: 'baths', emoji: '🛁' },
  { activity: 'using a clothes dryer', co2PerUnit: 1000, unit: 'loads', emoji: '👕' },
  { activity: 'drinking bottled water', co2PerUnit: 83, unit: 'bottles', emoji: '💧' },
  { activity: 'eating a beef burger', co2PerUnit: 2200, unit: 'burgers', emoji: '🍔' },
  { activity: 'streaming video', co2PerUnit: 36, unit: 'hours', emoji: '📹' },
  { activity: 'leaving lights on', co2PerUnit: 43, unit: 'hours', emoji: '💡' },
  { activity: 'throwing away food', co2PerUnit: 100, unit: 'times', emoji: '🗑️' },
];

export default function ImpactScreen({ navigation }) {
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [surveyHistory, setSurveyHistory] = useState([]);
  const [latestSurvey, setLatestSurvey] = useState(null);
  const [showPastSurveys, setShowPastSurveys] = useState(false);

  useEffect(() => {
    loadSurveyData();
    checkSurveyTimer();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSurveyData();
    });
    return unsubscribe;
  }, [navigation]);

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

  const checkSurveyTimer = async () => {
    try {
      const lastDate = await loadData('lastSurveyDate');
      const now = new Date();
      if (lastDate) {
        const lastSurvey = new Date(lastDate);
        const daysSinceLastSurvey = (now - lastSurvey) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSurvey >= 7) {
          setTimeout(() => setShowSurveyPopup(true), 2000);
        }
      } else {
        setTimeout(() => setShowSurveyPopup(true), 3000);
      }
    } catch (error) {
      console.error('Error checking survey timer:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 400) return '#22C55E';
    if (score >= 300) return '#84CC16';
    if (score >= 200) return '#EAB308';
    if (score >= 100) return '#F97316';
    if (score == "----") return '#000000';
    return '#EF4444';
  };

  const getScoreRating = (score) => {
    if (score >= 400) return 'Climate Hero! 🌟';
    if (score >= 300) return 'Eco Champion! 🌱';
    if (score >= 200) return 'Earth Friend 🌍';
    if (score >= 100) return 'Getting Better 📈';
    if (score == "----") return 'Fill out a survey to get a score';
    return 'Room to Grow 🌱';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const generateComparisons = (co2Grams) => {
    return CARBON_COMPARISONS.map(comp => {
      const amount = (co2Grams / comp.co2PerUnit).toFixed(1);
      return {
        ...comp,
        amount: parseFloat(amount),
        description: `${amount} ${comp.unit} of ${comp.activity}`
      };
    });
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
      labels: recentHistory.map((entry) => formatDate(entry.date)),
      datasets: [
        {
          data: recentHistory.map(entry => entry.score),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: new Array(recentHistory.length).fill("----"),
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

  const SurveyPopup = () => (
    <Modal visible={showSurveyPopup} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📊 Weekly Climate Survey</Text>
            <TouchableOpacity onPress={() => setShowSurveyPopup(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            It's time to track your environmental impact! This survey helps calculate your carbon footprint.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSurveyPopup(false);
                navigation.navigate('Survey');
              }}
            >
              <Text style={styles.modalButtonText}>Take Survey</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSecondaryButton}
              onPress={() => setShowSurveyPopup(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const PastSurveysModal = () => (
    <Modal visible={showPastSurveys} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>📈 Past Surveys</Text>
          <TouchableOpacity onPress={() => setShowPastSurveys(false)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.pastSurveysContainer}>
          {surveyHistory.map((survey) => (
            <View key={survey.id} style={styles.pastSurveyItem}>
              <View style={styles.pastSurveyHeader}>
                <Text style={styles.pastSurveyDate}>{formatDate(survey.date)}</Text>
                <View style={styles.pastSurveyStats}>
                  <Text style={[styles.pastSurveyScore, { color: getScoreColor(survey.score) }]}>
                    {survey.score}
                  </Text>
                  <Text style={styles.pastSurveyCO2}>{survey.totalCO2}g CO₂</Text>
                </View>
              </View>
              <Text style={[styles.pastSurveyRating, { color: getScoreColor(survey.score) }]}>
                {getScoreRating(survey.score)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const currentScore = latestSurvey?.score || "----";
  const currentCO2 = latestSurvey?.totalCO2 || "---- ";
  const comparisons = currentCO2 > 0 ? generateComparisons(currentCO2) : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🎯 Your Environmental Impact</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress Over Time</Text>
          {renderChart()}
          <Text style={styles.chartNote}>Gray line shows world average (250)</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: getScoreColor(currentScore) }]}>
              {currentScore}
            </Text>
            <Text style={styles.statLabel}>Climate Score</Text>
            <Text style={[styles.statRating, { color: getScoreColor(currentScore) }]}>
              {getScoreRating(currentScore)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{currentCO2}g</Text>
            <Text style={styles.statLabel}>CO₂ This Week</Text>
            <Text style={styles.statSubtext}>
              {currentCO2 > 0 ? `${(currentCO2 / 7).toFixed(0)}g/day avg` : 'No data'}
            </Text>
          </View>
        </View>
        <View style={styles.surveySection}>
          <Text style={styles.sectionTitle}>Survey Status</Text>
          <Text style={styles.lastSurveyText}>
            Last completed: {formatDate(latestSurvey?.date)}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.surveyButton}
              onPress={() => navigation.navigate('Survey')}
            >
              <Text style={styles.surveyButtonText}>📋 Take Survey</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowPastSurveys(true)}
            >
              <Text style={styles.secondaryButtonText}>📈 View History</Text>
            </TouchableOpacity>
          </View>
        </View>
        {comparisons.length > 0 && (
          <View style={styles.comparisonsSection}>
            <Text style={styles.sectionTitle}>Your Carbon Impact Equals</Text>
            <Text style={styles.comparisonsSubtitle}>
              Your {currentCO2}g of CO₂ emissions this week is equivalent to:
            </Text>
            {comparisons.map((comp, index) => (
              <View key={index} style={styles.comparisonItem}>
                <Text style={styles.comparisonEmoji}>{comp.emoji}</Text>
                <Text style={styles.comparisonText}>{comp.description}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <SurveyPopup />
      <PastSurveysModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8', padding: 20 },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
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
    fontSize: 18,
    fontFamily: 'Quicksand-SemiBold',
    color: '#1B4332',
    marginBottom: 15,
  },
  chart: { borderRadius: 16 },
  chartPlaceholder: {
    height: 200,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: 'Quicksand-Bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  statRating: {
    fontSize: 12,
    fontFamily: 'Quicksand-SemiBold',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    fontFamily: 'Quicksand-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  surveySection: {
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand-SemiBold',
    color: '#1B4332',
    marginBottom: 12,
  },
  lastSurveyText: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  surveyButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  surveyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  comparisonsSection: {
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
  comparisonsSubtitle: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  comparisonText: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#374151',
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    flex: 1,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Quicksand-SemiBold',
    paddingHorizontal: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: { gap: 12 },
  modalButton: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  modalSecondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
  },
  pastSurveysContainer: { padding: 20 },
  pastSurveyItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pastSurveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastSurveyDate: {
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
    color: '#1B4332',
  },
  pastSurveyStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pastSurveyScore: {
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    marginRight: 8,
  },
  pastSurveyCO2: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
  },
  pastSurveyRating: {
    fontSize: 13,
    fontFamily: 'Quicksand-SemiBold',
    marginTop: 6,
  },
});
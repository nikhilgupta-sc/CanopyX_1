import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { QUESTION_BANK } from './constants/QUESTION_BANK';
import { getUserQuestionSet, saveSurveyToHistory } from './storage';

/* ---------- UI widgets ---------- */

const Stepper = ({ value, min, max, onChange }) => (
  <View style={styles.stepperContainer}>
    <View style={styles.stepperControls}>
      <TouchableOpacity
        style={styles.stepperBtn}
        onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={styles.stepperTxt}>-</Text>
      </TouchableOpacity>

      <Text style={styles.stepperVal}>{value}</Text>

      <TouchableOpacity
        style={styles.stepperBtn}
        onPress={() => onChange(Math.min(max, value + 1))}>
        <Text style={styles.stepperTxt}>+</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.stepperRange}>
      <Text style={styles.rangeText}>{min}</Text>
      <Text style={styles.rangeText}>{max}</Text>
    </View>
  </View>
);

/* ---------- Screen ---------- */

export default function SurveyScreen({ navigation }) {
  const [questionIds, setQuestionIds] = useState([]);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* Load or create the user's fixed 11-question set */
  useEffect(() => {
    getUserQuestionSet().then(setQuestionIds);
  }, []);

  const updateResponse = (qid, val) =>
    setResponses((prev) => ({ ...prev, [qid]: val }));

  /* ---- scoring helpers ---- */

  // 1. world average CO₂ total based on QUESTION_BANK.avgValue
  const worldAvgTotal = QUESTION_BANK.reduce(
    (sum, q) => sum + q.avgValue * q.co2PerUnit,
    0
  );

  // 2. grams per point
  const gPerPoint = worldAvgTotal / 250; // baseline

  const computeUserScore = () => {
    const userTotal = questionIds.reduce((sum, id) => {
      const q = QUESTION_BANK.find((q) => q.id === id);
      const val = responses[id] ?? 0;
      return sum + val * q.co2PerUnit;
    }, 0);

    const raw = userTotal / gPerPoint; // 0‒∞
    const inverted = Math.round(Math.min(500, Math.max(0, 500 - raw))); // 0‒500, high good
    return { raw, inverted, userTotal };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { inverted, userTotal } = computeUserScore();

      const surveyData = {
        responses: responses,
        score: inverted,
        totalCO2: Math.round(userTotal),
      };

      await saveSurveyToHistory(surveyData);

      Alert.alert(
        'Survey Complete!',
        `Your score: ${inverted}/500\nWeekly CO₂: ${surveyData.totalCO2}g`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (Object.keys(responses).length > 0) {
      Alert.alert(
        'Exit Survey?',
        'You have unsaved responses. Are you sure you want to exit?',
        [
          { text: 'Continue Survey', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  /* ---- render helpers ---- */

  const renderQuestion = (q) => {
    const value = responses[q.id] ?? q.min;

    return (
      <View key={q.id} style={styles.card}>
        <Text style={styles.qText}>{q.text}</Text>

        {q.type === 'slider' ? (
          <>
            <Stepper
              value={value}
              min={q.min}
              max={q.max}
              onChange={(v) => updateResponse(q.id, v)}
            />
            <Text style={styles.unitText}>
              {value} {q.unit}
            </Text>
          </>
        ) : (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder={`0 ${q.unit}`}
            value={String(value)}
            onChangeText={(t) => updateResponse(q.id, parseFloat(t) || 0)}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Weekly Climate Survey</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={styles.subtitle}>
          Help us calculate your carbon footprint by answering these questions
          about your weekly activities.
        </Text>

        {questionIds.map((id) =>
          renderQuestion(QUESTION_BANK.find((q) => q.id === id))
        )}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            submitting && { backgroundColor: '#9CA3AF' },
          ]}
          disabled={submitting}
          onPress={handleSubmit}>
          <Text style={styles.submitTxt}>
            {submitting ? 'Calculating...' : '🌍 Calculate My Impact'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  close: { fontSize: 20, color: '#6B7280', fontFamily: 'Quicksand-SemiBold' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#1B4332',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 15,
    color: '#1B4332',
    marginBottom: 12,
    lineHeight: 22,
  },
  stepperContainer: { alignItems: 'center' },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTxt: { color: '#FFF', fontSize: 20, fontFamily: 'Quicksand-Bold' },
  stepperVal: {
    fontSize: 22,
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  stepperRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  rangeText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  unitText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    fontFamily: 'Quicksand-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 24,
  },
  submitTxt: { color: '#FFF', fontFamily: 'Quicksand-SemiBold', fontSize: 16 },
});

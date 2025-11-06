import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

// Example climate data – replace images with your own if desired
const places = [
  {
    key: "1",
    name: "Amazon Rainforest",
    images: {
      0: "https://picsum.photos/700/400?random=1",
      25: "https://picsum.photos/700/400?random=2",
      50: "https://picsum.photos/700/400?random=3",
      100: "https://picsum.photos/700/400?random=4",
    },
    overlays: {
      25: [{ x: 50, y: 100, text: "Some biodiversity loss projected." }],
      50: [{ x: 120, y: 80, text: "Severe deforestation impact." }],
      100: [{ x: 200, y: 150, text: "Habitat almost completely destroyed." }],
    },
  },
  {
    key: "2",
    name: "Great Barrier Reef",
    images: {
      0: "https://picsum.photos/700/400?random=5",
      25: "https://picsum.photos/700/400?random=6",
      50: "https://picsum.photos/700/400?random=7",
      100: "https://picsum.photos/700/400?random=8",
    },
    overlays: {
      25: [{ x: 80, y: 120, text: "Initial coral bleaching signs." }],
      50: [{ x: 140, y: 90, text: "Major bleaching and fish loss." }],
      100: [{ x: 180, y: 130, text: "Coral reef ecosystem collapse." }],
    },
  },
];

const timeLabels = [0, 25, 50, 100];
const timeColors = ["#4CAF50", "#FF9800", "#FF5722", "#D32F2F"];

export default function ClimateOverlayScreen() {
  const [selectedPlace, setSelectedPlace] = useState(places[0]);
  const [yearIdx, setYearIdx] = useState(0);
  const [showOverlay, setShowOverlay] = useState(null);

  const handlePlaceChange = (place) => {
    setSelectedPlace(place);
    setYearIdx(0);
    setShowOverlay(null);
  };

  const handleYearChange = (idx) => {
    setYearIdx(idx);
    setShowOverlay(null);
  };

  const renderBubbles = () => {
    const year = timeLabels[yearIdx];
    if (year === 0) return null;

    const overlays = selectedPlace.overlays[year] || [];
    return overlays.map((bubble, i) => (
      <TouchableOpacity
        key={i}
        style={[
          styles.bubble,
          {
            left: bubble.x,
            top: bubble.y,
            backgroundColor: timeColors[yearIdx],
          },
        ]}
        onPress={() => setShowOverlay(i)}
      >
        <Text style={styles.bubbleNumber}>{i + 1}</Text>
      </TouchableOpacity>
    ));
  };

  const renderOverlayModal = () => {
    const year = timeLabels[yearIdx];
    if (year === 0) return null;

    const overlays = selectedPlace.overlays[year] || [];
    if (showOverlay === null || !overlays[showOverlay]) return null;

    return (
      <Modal
        visible={showOverlay !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOverlay(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowOverlay(null)}
        >
          <View style={styles.overlayTextBox}>
            <Text style={styles.overlayTitle}>Climate Impact</Text>
            <Text style={styles.overlayText}>
              {overlays[showOverlay].text}
            </Text>
            <TouchableOpacity
              onPress={() => setShowOverlay(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>THE WORLD IN THE FUTURE</Text>
        <Text style={styles.subheading}>Climate Change Impacts by 2125</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Location Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.buttonScrollView}
        >
          {places.map((place) => (
            <TouchableOpacity
              key={place.key}
              style={[
                styles.placeBtn,
                selectedPlace.key === place.key && styles.selectedBtn,
              ]}
              onPress={() => handlePlaceChange(place)}
            >
              <Text
                style={[
                  styles.placeBtnText,
                  selectedPlace.key === place.key && styles.selectedBtnText,
                ]}
              >
                {place.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Year Selection Buttons */}
        <View style={styles.yearButtonRow}>
          {timeLabels.map((label, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.yearBtn,
                idx === yearIdx && { backgroundColor: timeColors[idx] },
              ]}
              onPress={() => handleYearChange(idx)}
            >
              <Text
                style={[
                  styles.yearBtnText,
                  idx === yearIdx && { color: "#FFF", fontWeight: "bold" },
                ]}
              >
                {label === 0 ? "Now" : `${label}yr`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Image Display */}
        <View style={styles.imageBox}>
          <Image
            source={{ uri: selectedPlace.images[timeLabels[yearIdx]] }}
            style={styles.mainImg}
            resizeMode="cover"
          />
          {renderBubbles()}
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>{selectedPlace.name}</Text>
          <Text style={styles.descriptionText}>
            {timeLabels[yearIdx] === 0
              ? `Current state: This ecosystem is currently stable and supporting diverse life.`
              : `Projected changes by ${
                  2025 + timeLabels[yearIdx]
                }: Significant environmental stress and ecosystem changes expected.`}
          </Text>
          {timeLabels[yearIdx] > 0 && (
            <Text style={styles.tapHint}>
              Tap the numbered bubbles on the image to see specific changes
            </Text>
          )}
        </View>
      </ScrollView>

      {renderOverlayModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 4,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    color: "#E3F2FD",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "300",
  },
  content: { flex: 1, padding: 20 },
  buttonScrollView: { marginBottom: 20 },
  placeBtn: {
    backgroundColor: "#E3F2FD",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  selectedBtn: { backgroundColor: "#1976D2" },
  placeBtnText: { color: "#1976D2", fontWeight: "600", fontSize: 14 },
  selectedBtnText: { color: "#FFFFFF" },
  yearButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  yearBtn: {
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  yearBtnText: { color: "#000", fontSize: 14 },
  imageBox: {
    alignSelf: "center",
    width: width - 40,
    height: 250,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  mainImg: { width: "100%", height: "100%" },
  bubble: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleNumber: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayTextBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    maxWidth: width - 80,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
    textAlign: "center",
  },
  overlayText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  closeButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 10,
  },
  tapHint: {
    fontSize: 12,
    color: "#999999",
    fontStyle: "italic",
    textAlign: "center",
  },
});

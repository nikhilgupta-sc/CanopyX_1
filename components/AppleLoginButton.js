import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const AppleLoginButton = ({ style, textStyle, loading = false }) => {
  const { signInWithApple } = useAuth();

  // Only show Apple login on iOS devices
  if (Platform.OS !== 'ios') {
    return null;
  }

  const handlePress = async () => {
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Apple login failed:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>Sign in with Apple</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AppleLoginButton;
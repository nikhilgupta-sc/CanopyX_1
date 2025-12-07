import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const GoogleLoginButton = ({ style, textStyle, loading = false, onPress }) => {
  const handlePress = async () => {
    try {
      if (onPress) {
        await onPress();
      }
    } catch (error) {
      console.error('Google login failed:', error);
      let errorMessage = 'Unable to sign in with Google. Please try again.';
      
      if (error.message.includes('Apple Sign-In')) {
        errorMessage = 'Apple Sign-In is only available on iOS. Please use Google Sign-In or email login.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style, loading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]}>Sign in with Google</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DB4437',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily:'Quicksand-Medium'
  },
});

export default GoogleLoginButton;


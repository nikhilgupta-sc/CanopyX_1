import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { saveData } from './storage';
import { AuthContext } from './App';
// Import vector icons
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { handleSignupSuccess } = useContext(AuthContext);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !age.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        age: parseInt(age) || 18,
        password: password,
        isLoggedIn: true,
        signUpDate: new Date().toISOString(),
      };
      await saveData('userData', userData);
      handleSignupSuccess();
    } catch (error) {
      console.error('SignUp error:', error);
      handleSignupSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  // Handler stubs for social sign-ins
  const handleGoogleSignIn = () => Alert.alert('Google Sign-In', 'Google flow here.');
  const handleGithubSignIn = () => Alert.alert('GitHub Sign-In', 'GitHub flow here.');
  const handleMicrosoftSignIn = () => Alert.alert('Microsoft Sign-In', 'Microsoft flow here.');
  const handleLinkedInSignIn = () => Alert.alert('LinkedIn Sign-In', 'LinkedIn flow here.');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to CanopyX!</Text>
            <Text style={styles.subtitle}>
              Learn about climate change and track your environmental impact
            </Text>

          
         

            <View style={styles.form}>
              {/* Form fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
                 <Text style={styles.socialRowText}>Sign up with</Text>
                {/* Social login icons row */}
            <View style={styles.socialRow}>
              <SocialIconButton
                Icon={FontAwesome} name="google" color="#EA4335"
                onPress={handleGoogleSignIn} bgColor="#fff" borderColor="#E5E7EB"
              />
              <SocialIconButton
                Icon={MaterialCommunityIcons} name="microsoft" color="#0067B8"
                onPress={handleMicrosoftSignIn} bgColor="#fff" borderColor="#E5E7EB"
              />
              <SocialIconButton
                Icon={FontAwesome} name="github" color="#fff"
                onPress={handleGithubSignIn} bgColor="#24292F" borderColor="#24292F"
              />
              <SocialIconButton
                Icon={FontAwesome} name="apple" color="#fff"
                onPress={handleLinkedInSignIn} bgColor="#0077B5" borderColor="#0077B5"
              />
            </View>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}>
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Get Started</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Social icon button component
function SocialIconButton({ Icon, name, color, onPress, bgColor, borderColor }) {
  return (
    <TouchableOpacity
      style={[styles.socialIconButton, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon name={name} size={28} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
    color: '#1B4332',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    backgroundColor: '#FFFFFF',
    minHeight: 52,
  },
  button: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
  },
  linkTextBold: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#22C55E',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  socialIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  socialRowText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Quicksand-Regular',
  },
});

import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const C = {
  background: '#F7F5EE',
  surface: '#FFFFFF',
  green: '#174A3A',
  greenDark: '#103629',
  gold: '#E5AC55',
  text: '#26372F',
  muted: '#78847B',
  border: '#E5E1D7',
  error: '#C94A4A',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing information', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const success = await login(email, password);

      if (!success) {
        Alert.alert(
          'Login failed',
          'Incorrect email or password. Please try again.'
        );
        return;
      }

      router.replace('/');
    } catch (error) {
      console.log('Login screen error:', error);
      Alert.alert(
        'Something went wrong',
        'Unable to log in right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="cart-outline" size={34} color={C.surface} />
            </View>

            <Text style={styles.brand}>Malnora</Text>

            <Text style={styles.tagline}>
              Fresh groceries. Simple shopping.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Login to continue shopping with Malnora.
            </Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={C.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={C.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={C.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={C.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((value) => !value)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={21}
                    color={C.muted}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.surface} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={C.surface}
                  />
                </>
              )}
            </Pressable>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>

              <Pressable
                onPress={() => router.push('/signup')}
                disabled={loading}
              >
                <Text style={styles.signupLink}> Create one</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footerText}>
            Your everyday shopping companion
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 36,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 5,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  brand: {
    fontSize: 32,
    fontWeight: '900',
    color: C.green,
    letterSpacing: -0.5,
  },

  tagline: {
    fontSize: 13,
    color: C.muted,
    marginTop: 5,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: C.text,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
    marginTop: 6,
    marginBottom: 24,
  },

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },

  inputWrapper: {
    height: 54,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    backgroundColor: '#FCFCFA',
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    marginLeft: 15,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 15,
  },

  eyeButton: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },

  loginButton: {
    height: 55,
    borderRadius: 16,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 5,
  },

  loginButtonText: {
    color: C.surface,
    fontSize: 16,
    fontWeight: '900',
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  signupText: {
    color: C.muted,
    fontSize: 13,
  },

  signupLink: {
    color: C.green,
    fontSize: 13,
    fontWeight: '900',
  },

  footerText: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 12,
    marginTop: 24,
  },
});
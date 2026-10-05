import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
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
  text: '#26372F',
  muted: '#78847B',
  border: '#E5E1D7',
  error: '#C94A4A',
  success: '#2E7D4F',
};

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const showMessage = (
    text: string,
    type: 'error' | 'success'
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSignup = async () => {
    console.log('CREATE ACCOUNT BUTTON PRESSED');

    setMessage('');
    setMessageType('');

    if (!name.trim()) {
      showMessage('Please enter your full name.', 'error');
      return;
    }

    if (!email.trim()) {
      showMessage('Please enter your email address.', 'error');
      return;
    }

    if (!email.includes('@')) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    if (!phone.trim()) {
      showMessage('Please enter your phone number.', 'error');
      return;
    }

    if (cleanPhone.length !== 10) {
      showMessage(
        'Please enter a valid 10-digit phone number.',
        'error'
      );
      return;
    }

    if (password.length < 6) {
      showMessage(
        'Password must contain at least 6 characters.',
        'error'
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        'Passwords do not match.',
        'error'
      );
      return;
    }

    try {
      setLoading(true);

      console.log('Calling signup function...');

      const success = await signup(
        name.trim(),
        email.trim(),
        cleanPhone,
        password
      );

      console.log('Signup result:', success);

      if (!success) {
        showMessage(
          'An account with this email already exists.',
          'error'
        );
        return;
      }

      showMessage(
        'Account created successfully! Redirecting...',
        'success'
      );

      setTimeout(() => {
        router.replace('/');
      }, 800);
    } catch (error) {
      console.log('SIGNUP ERROR:', error);

      showMessage(
        'Something went wrong while creating your account.',
        'error'
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
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={C.green}
            />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="person-add-outline"
                size={31}
                color={C.surface}
              />
            </View>

            <Text style={styles.brand}>Join Malnora</Text>

            <Text style={styles.tagline}>
              Create your account and start shopping.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>

            <Text style={styles.subtitle}>
              Enter your details to get started.
            </Text>

            {message ? (
              <View
                style={[
                  styles.messageBox,
                  messageType === 'success'
                    ? styles.successBox
                    : styles.errorBox,
                ]}
              >
                <Ionicons
                  name={
                    messageType === 'success'
                      ? 'checkmark-circle-outline'
                      : 'alert-circle-outline'
                  }
                  size={20}
                  color={
                    messageType === 'success'
                      ? C.success
                      : C.error
                  }
                />

                <Text
                  style={[
                    styles.messageText,
                    messageType === 'success'
                      ? styles.successText
                      : styles.errorText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            {/* NAME */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full name</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={C.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={C.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            {/* EMAIL */}
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

            {/* PHONE */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone number</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={C.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={C.muted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!loading}
                />
              </View>
            </View>

            {/* PASSWORD */}
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
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={C.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowPassword((value) => !value)
                  }
                  disabled={loading}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={C.muted}
                  />
                </Pressable>
              </View>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm password</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={C.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={C.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  disabled={loading}
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={C.muted}
                  />
                </Pressable>
              </View>
            </View>

            {/* CREATE ACCOUNT */}
            <Pressable
              style={({ pressed }) => [
                styles.signupButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.surface} />
              ) : (
                <>
                  <Text style={styles.signupButtonText}>
                    Create Account
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={C.surface}
                  />
                </>
              )}
            </Pressable>

            {/* LOGIN */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <Pressable
                onPress={() => router.replace('/login')}
                disabled={loading}
              >
                <Text style={styles.loginLink}>
                  {' '}Login
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footerText}>
            Shop fresh. Shop simple. Shop Malnora.
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
    paddingVertical: 25,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  brand: {
    fontSize: 29,
    fontWeight: '900',
    color: C.green,
  },

  tagline: {
    fontSize: 13,
    color: C.muted,
    marginTop: 5,
    textAlign: 'center',
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
    marginBottom: 20,
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    gap: 9,
  },

  errorBox: {
    backgroundColor: '#FFF1F1',
    borderWidth: 1,
    borderColor: '#F3CCCC',
  },

  successBox: {
    backgroundColor: '#EEF8F1',
    borderWidth: 1,
    borderColor: '#C8E6D0',
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  errorText: {
    color: C.error,
  },

  successText: {
    color: C.success,
  },

  fieldContainer: {
    marginBottom: 16,
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

  signupButton: {
    height: 55,
    borderRadius: 16,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 5,
  },

  signupButtonText: {
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

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  loginText: {
    color: C.muted,
    fontSize: 13,
  },

  loginLink: {
    color: C.green,
    fontSize: 13,
    fontWeight: '900',
  },

  footerText: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 12,
    marginTop: 22,
  },
});
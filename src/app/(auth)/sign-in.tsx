import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { ErrorState } from '@shared/components/ErrorState';
import { useServices } from '@services/useServices';
import { colors, fontSize, spacing } from '@theme/tokens';

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { auth } = useServices();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await auth.signInWithEmail(email, password);
      router.replace('/(main)/journal');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('signIn.genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await auth.signInWithGoogle();
      router.replace('/(main)/journal');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('signIn.googleError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setError(null);
    setLoading(true);
    try {
      await auth.signInWithApple();
      router.replace('/(main)/journal');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('signIn.appleError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>{t('signIn.title')}</Text>
      {error ? <ErrorState message={error} /> : null}
      <TextInput
        style={styles.input}
        placeholder={t('signIn.emailPlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder={t('signIn.passwordPlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
      />
      <Button
        label={loading ? t('signIn.submitButtonLoading') : t('signIn.submitButton')}
        onPress={() => {
          void handleSignIn();
        }}
        disabled={loading || !email || !password}
      />
      <Button
        label={t('signIn.googleButton')}
        variant="secondary"
        onPress={() => {
          void handleGoogle();
        }}
        disabled={loading}
      />
      <Button
        label={t('signIn.appleButton')}
        variant="secondary"
        onPress={() => {
          void handleApple();
        }}
        disabled={loading}
      />
      <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
        <Text style={styles.link}>{t('signIn.createAccountLink')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.inputSurface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderElevated,
  },
  link: {
    color: colors.accentText,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

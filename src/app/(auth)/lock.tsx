import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { useServices } from '@services/useServices';
import { colors, fontSize, spacing } from '@theme/tokens';

export default function LockScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { localLock } = useServices();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void attemptBiometric();
  }, []);

  const attemptBiometric = async () => {
    const success = await localLock.authenticate(t('lock.biometricPrompt'));
    if (success) {
      router.replace('/(main)/journal');
    }
  };

  const handlePinSubmit = async () => {
    setError(null);
    const success = await localLock.verifyPin(pin);
    if (success) {
      router.replace('/(main)/journal');
    } else {
      setError(t('lock.incorrectPinError'));
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌙</Text>
      <Text style={styles.title}>{t('lock.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('lock.pinPlaceholder')}
        placeholderTextColor={colors.textMuted}
        value={pin}
        onChangeText={setPin}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={8}
        accessibilityLabel={t('lock.pinA11yLabel')}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label={t('lock.unlockButton')}
        onPress={() => {
          void handlePinSubmit();
        }}
        disabled={pin.length < 4}
      />
      <TouchableOpacity
        onPress={() => {
          void attemptBiometric();
        }}
      >
        <Text style={styles.biometricLink}>{t('lock.biometricLink')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-pin')}>
        <Text style={styles.forgotLink}>{t('lock.forgotPinLink')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  logo: { fontSize: 56 },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputSurface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderElevated,
    textAlign: 'center',
    letterSpacing: 8,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
  },
  biometricLink: {
    color: colors.accentText,
    fontSize: fontSize.md,
  },
  forgotLink: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});

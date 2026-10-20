import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { supabase } from '../../supabase/client';
import { useServices } from '@services/useServices';
import { colors, fontSize, spacing } from '@theme/tokens';

export default function ForgotPinScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { localLock: lockService } = useServices();
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [loading, setLoading] = useState(false);

  const handleVerifyPassword = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No email');
      const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
      if (error) throw error;
      setStep('reset');
    } catch {
      Alert.alert(
        t('forgotPin.verificationFailedAlertTitle'),
        t('forgotPin.verificationFailedAlertBody')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (newPin !== confirmPin) {
      Alert.alert(t('forgotPin.pinMismatchAlertTitle'), t('forgotPin.pinMismatchAlertBody'));
      return;
    }
    setLoading(true);
    try {
      await lockService.setupPin(newPin);
      Alert.alert(t('forgotPin.pinUpdatedAlertTitle'), t('forgotPin.pinUpdatedAlertBody'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {step === 'verify' ? (
        <>
          <Text style={styles.title}>{t('forgotPin.verifyTitle')}</Text>
          <Text style={styles.subtitle}>{t('forgotPin.verifySubtitle')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('forgotPin.passwordPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <Button
            label={t('forgotPin.verifyButton')}
            onPress={() => {
              void handleVerifyPassword();
            }}
            disabled={loading || !password}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>{t('forgotPin.newPinTitle')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('forgotPin.newPinPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />
          <TextInput
            style={styles.input}
            placeholder={t('forgotPin.confirmPinPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />
          <Button
            label={t('forgotPin.resetButton')}
            onPress={() => {
              void handleResetPin();
            }}
            disabled={loading || newPin.length < 4}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
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
});

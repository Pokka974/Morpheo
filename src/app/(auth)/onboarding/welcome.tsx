import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { colors, fontSize, spacing } from '@theme/tokens';

export default function OnboardingWelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌙</Text>
      <Text style={styles.title}>{t('common.appName')}</Text>
      <Text style={styles.tagline}>{t('onboardingWelcome.tagline')}</Text>
      <Button
        label={t('onboardingWelcome.getStarted')}
        onPress={() => router.push('/(auth)/onboarding/consent')}
      />
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
  logo: {
    fontSize: 72,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

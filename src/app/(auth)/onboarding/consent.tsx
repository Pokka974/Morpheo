import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { supabase } from '@services/../supabase/client';
import { colors, fontSize, spacing } from '@theme/tokens';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@shared/legalLinks';

export default function OnboardingConsentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleAgree = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ ai_consent_granted: true, ai_consent_granted_at: new Date().toISOString() })
          .eq('id', user.id);

        if (updateError) {
          console.error('Consent update failed:', updateError);
          Alert.alert(t('onboardingConsent.errorTitle'), t('onboardingConsent.saveErrorBody'));
          return;
        }

        const { error: consentRecordError } = await supabase
          .from('consent_records')
          .insert({ user_id: user.id, action: 'granted' });
        // Non-fatal: profiles.ai_consent_granted is the source of truth the rest of the
        // app gates on, and it already wrote successfully above. This row is an audit
        // trail, not a second copy of the flag — logged rather than blocking onboarding.
        if (consentRecordError) {
          console.error('Consent record insert failed:', consentRecordError);
        }
      }
      router.push('/(auth)/onboarding/lock-setup');
    } catch (e) {
      console.error('Consent screen error:', e);
      Alert.alert(t('onboardingConsent.errorTitle'), t('onboardingConsent.genericErrorBody'));
    } finally {
      setLoading(false);
    }
  };

  const handleNoThanks = () => {
    Alert.alert(
      t('onboardingConsent.requiredAlertTitle'),
      t('onboardingConsent.requiredAlertBody'),
      [{ text: t('common.ok'), style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboardingConsent.title')}</Text>
      <View style={styles.card}>
        <Text style={styles.bodyText}>{t('onboardingConsent.intro')}</Text>
        <Text style={styles.bodyText}>{t('onboardingConsent.bulletEncrypted')}</Text>
        <Text style={styles.bodyText}>
          {t('onboardingConsent.neverTrainedPrefix')}
          <Text style={styles.bold}>{t('onboardingConsent.neverTrainedBold')}</Text>
          {t('onboardingConsent.neverTrainedSuffix')}
        </Text>
        <Text style={styles.bodyText}>{t('onboardingConsent.bulletAdvice')}</Text>
        <Text style={styles.bodyText}>{t('onboardingConsent.bulletRevoke')}</Text>
        <View style={styles.linksRow}>
          <Text
            style={styles.link}
            onPress={() => {
              void Linking.openURL(PRIVACY_POLICY_URL);
            }}
          >
            {t('onboardingConsent.privacyPolicyLink')}
          </Text>
          <Text style={styles.linkSeparator}>·</Text>
          <Text
            style={styles.link}
            onPress={() => {
              void Linking.openURL(TERMS_OF_SERVICE_URL);
            }}
          >
            {t('onboardingConsent.termsOfServiceLink')}
          </Text>
        </View>
      </View>
      <Button
        label={t('onboardingConsent.agreeButton')}
        onPress={() => {
          void handleAgree();
        }}
        disabled={loading}
      />
      <Button
        label={t('onboardingConsent.noThanksButton')}
        variant="ghost"
        onPress={handleNoThanks}
      />
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
  card: {
    backgroundColor: colors.inputSurface,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  bodyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: colors.accentText,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.accentText,
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

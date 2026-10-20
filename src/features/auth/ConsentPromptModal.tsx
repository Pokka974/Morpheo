import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '@shared/components/Button';
import { supabase } from '../../supabase/client';
import { colors, fontSize, spacing } from '@theme/tokens';

interface Props {
  visible: boolean;
  onGranted: () => void;
  onDismiss: () => void;
}

export function ConsentPromptModal({ visible, onGranted, onDismiss }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            ai_consent_granted: true,
            ai_consent_granted_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        await supabase.from('consent_records').insert({ user_id: user.id, action: 'granted' });
      }
      onGranted();
    } catch {
      onGranted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('consentPromptModal.title')}</Text>
          <Text style={styles.body}>{t('consentPromptModal.body')}</Text>
          <Button
            label={
              loading
                ? t('consentPromptModal.grantButtonLoading')
                : t('consentPromptModal.grantButton')
            }
            onPress={() => {
              void handleGrant();
            }}
            disabled={loading}
          />
          <Button
            label={t('consentPromptModal.dismissButton')}
            variant="ghost"
            onPress={onDismiss}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.inputSurface,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.lg,
    width: '100%',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

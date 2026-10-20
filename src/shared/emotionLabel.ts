import { emotionColors } from '@theme/tokens';

/**
 * Translates a dreamer's own emotion tag (closed set of 10 keys in `emotionColors`)
 * but passes AI-generated free text through unchanged — it's already written in the
 * dream's language by the interpretation prompt (system_prompts.sql v2.1.0), and has
 * no locale key.
 */
export function emotionLabel(t: (key: string) => string, emotion: string): string {
  return emotion in emotionColors ? t(`emotions.${emotion}`) : emotion;
}

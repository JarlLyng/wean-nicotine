/**
 * "Send feedback" from Settings (#357).
 *
 * The app collects no usage data, so what people choose to write is how we
 * learn what works. This opens the user's own mail app with the address,
 * subject and the app and iOS versions filled in. They see all of it before
 * sending, and nothing is sent unless they press Send.
 */

export const SUPPORT_EMAIL = 'support@iamjarl.com';

export function buildFeedbackMailto(
  appVersion: string,
  buildNumber: string,
  osVersion: string,
): string {
  const subject = `Wean Nicotine ${appVersion} feedback`;
  const body = `\n\n\nApp: Wean Nicotine ${appVersion} (build ${buildNumber})\niOS: ${osVersion}\n`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

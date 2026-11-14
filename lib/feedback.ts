/**
 * "Send feedback" from Settings (#357).
 *
 * The app collects no usage data, so what people choose to write is how we
 * learn what works. This opens the user's own mail app with the address,
 * subject, the app version and the phone's system filled in. They see all of
 * it before sending, and nothing is sent unless they press Send.
 */

export const SUPPORT_EMAIL = 'support@iamjarl.com';

/** `system` is the whole label, "iOS 26.0" or "Android 16 (API 36)" (lib/app-info.ts). */
export function buildFeedbackMailto(
  appVersion: string,
  buildNumber: string,
  system: string,
): string {
  const subject = `Wean Nicotine ${appVersion} feedback`;
  const body = `\n\n\nApp: Wean Nicotine ${appVersion} (build ${buildNumber})\n${system}\n`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

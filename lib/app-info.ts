/**
 * Which binary is running, for the version line in Settings, the feedback
 * mail and Sentry. Each platform numbers its builds on its own: iOS has
 * `ios.buildNumber`, Android `android.versionCode` (#435).
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function appVersion(): string {
  return Constants.expoConfig?.version ?? '?';
}

export function appBuildNumber(): string {
  const config = Constants.expoConfig;
  const build = Platform.OS === 'android' ? config?.android?.versionCode : config?.ios?.buildNumber;
  return build == null ? '?' : String(build);
}

/** "iOS 26.0", or "Android 16 (API 36)": the release people know, and the level code checks. */
export function systemLabel(): string {
  if (Platform.OS === 'android') {
    const release = (Platform.constants as { Release?: string }).Release ?? '?';
    return `Android ${release} (API ${Platform.Version})`;
  }
  return `iOS ${Platform.Version}`;
}

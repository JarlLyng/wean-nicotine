/**
 * Sentry error tracking and monitoring
 * Configured for React Native/Expo
 *
 * Setup:
 * - Early init in app/_layout.tsx (before first render)
 * - Root component wrapped with Sentry.wrap() for native crash capture
 * - Sentry.ErrorBoundary wraps the React tree for JS error fallback
 * - captureError() called in every production catch-block
 *
 * Privacy guarantees (must stay aligned with website + App Store privacy copy):
 * - sendDefaultPii is false — Sentry will not collect IP, cookies, etc.
 * - User-controlled values (baseline pouches/day, price, currency, triggers,
 *   pouch logs, allowance, weeklyReductionPercent) are NEVER sent. Callers
 *   pass only technical `context` strings; the beforeSend scrubber below
 *   enforces this as defense-in-depth in case someone forgets.
 * - Performance tracing is enabled at 20% in production. Traces include
 *   screen names and timing, no usage values.
 * - Nothing tells one phone or installation apart (#444): every report carries
 *   the same fixed user, the device ID and the device/app hash are dropped, and
 *   session tracking is off because sessions carry the installation ID.
 *   JavaScript can't reach events made natively (a native crash, an ANR): the
 *   native SDKs still add Android's device ID and iOS's device/app hash there,
 *   and a data-scrubbing rule in the Sentry project removes them on arrival.
 *   See docs/PRIVACY_APP_STORE.md.
 * - Two anonymous feature counts (#448), through countFeatureUse: that a log
 *   entry was saved (not which kind) and that Edit plan was opened.
 *   Never a value from the log. beforeSendMetric keeps only the listed counts
 *   and attribute values, plus the build and SDK, and drops the user.
 */

import * as Sentry from '@sentry/react-native';
import { reactNavigationIntegration } from '@sentry/react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { appBuildNumber } from './app-info';
import { CAPTURE_MODE } from './capture-mode';

/**
 * Keys that must never reach Sentry. If any captureError caller passes one of
 * these in `extra`, beforeSend strips it before the event is sent. This is a
 * safety net — callers should not pass user data in the first place.
 */
const PII_KEYS = new Set<string>([
  'baseline',
  'baselinePouchesPerDay',
  'price',
  'pricePerCan',
  'currency',
  'triggers',
  'trigger',
  'raw',
  'pouchesUsedToday',
  'cravingsResistedToday',
  'dailyAllowance',
  'currentDailyAllowance',
  'weeklyReductionPercent',
  'logEntries',
  'userPlan',
  'taperSettings',
]);

/**
 * Strip known PII keys from a Sentry `extra` payload. Exported for unit testing.
 */
export function scrubExtra(
  extra: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!extra) return extra;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(extra)) {
    if (PII_KEYS.has(key)) {
      cleaned[key] = '[scrubbed]';
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Sanitize a breadcrumb before Sentry records it. `beforeSend` only scrubs
 * `event.extra`, but breadcrumbs are a separate path that rides along on every
 * event — and two default breadcrumb types can carry user data on a health app:
 *
 * - **`ui.click` (touch) breadcrumbs.** `Sentry.wrap()` enables the touch-event
 *   boundary, which labels taps by their `accessibilityLabel`. Our trigger chips
 *   are labelled with the trigger name ("Stress", "With coffee") — a health
 *   signal we scrub everywhere else. We drop the human-readable label/message
 *   and keep only the category, so the breadcrumb still shows "a tap happened"
 *   for debugging without naming what was tapped.
 * - **`console` breadcrumbs.** Any stray `console.*` in production becomes a
 *   breadcrumb verbatim. We drop the console breadcrumb's message text.
 *
 * Returns `null` to drop the breadcrumb entirely is avoided — we keep the
 * skeleton (category/type/level) for debugging value, minus any free text.
 * Exported for unit testing.
 */
export function scrubBreadcrumb(breadcrumb: {
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  type?: string;
}): typeof breadcrumb {
  const category = breadcrumb.category ?? '';
  // Touch / UI-interaction breadcrumbs: strip the label text + data payload.
  if (category === 'ui.click' || category === 'touch' || category.startsWith('ui.')) {
    return { ...breadcrumb, message: '[scrubbed]', data: undefined };
  }
  // Console breadcrumbs: strip the logged message + args.
  if (category === 'console') {
    return { ...breadcrumb, message: '[scrubbed]', data: undefined };
  }
  return breadcrumb;
}

/**
 * The same Sentry user on every phone (#444). With no user set, Sentry's native
 * SDKs fill in a random ID per installation, so a fixed value keeps that slot
 * taken without telling anyone apart.
 */
export const SHARED_SENTRY_USER = { id: 'anonymous' } as const;

type AnonymizableEvent = {
  user?: Record<string, unknown>;
  contexts?: Record<string, Record<string, unknown> | undefined>;
};

/**
 * Remove what could tell one phone or installation apart from an event (#444):
 * the user becomes the shared one, and the device ID (Android: the installation
 * ID) and the device/app hash (iOS: built from the vendor identifier) are
 * dropped. These ride along on JavaScript events through the device context the
 * native SDK hands over. Exported for unit testing.
 */
export function anonymizeEvent<E extends AnonymizableEvent>(event: E): E {
  event.user = { ...SHARED_SENTRY_USER };
  const device = event.contexts?.device;
  if (device && 'id' in device) {
    delete device.id;
  }
  const app = event.contexts?.app;
  if (app && 'device_app_hash' in app) {
    delete app.device_app_hash;
  }
  return event;
}

/**
 * Which Sentry environment a build reports to (#444, #448). Only a build from
 * the `production` EAS profile, on a real phone, is `production`. A release
 * build in the iOS Simulator or an Android emulator is `simulator`, and a
 * preview, capture or local build on a phone is `internal`, so test runs never
 * look like real crashes. The store binary is the same one TestFlight and
 * Play's internal track install, so those report as `production`. Exported for
 * unit testing.
 */
export function sentryEnvironment(isDev: boolean, isDevice: boolean, buildProfile: string): string {
  if (isDev) return 'development';
  if (!isDevice) return 'simulator';
  return buildProfile === 'production' ? 'production' : 'internal';
}

/**
 * The only feature counts Wean sends (#448), each with the only attribute
 * values it may carry (none today). A count says that a feature was used,
 * never a value from the person's log: no pouch numbers, amounts, dates or
 * triggers. log_entry_saved doesn't say whether a pouch or a resisted craving
 * was logged: that would be health data in Apple's and Google's terms (owner's
 * decision, 2026-11-15).
 */
const FEATURE_COUNTS: Record<string, Record<string, readonly string[]>> = {
  log_entry_saved: {},
  edit_plan_opened: {},
};

/** What the SDK adds to a metric that may stay: the build and the SDK. */
const SDK_METRIC_ATTRIBUTES = new Set([
  'sentry.release',
  'sentry.environment',
  'sentry.sdk.name',
  'sentry.sdk.version',
]);

/**
 * beforeSendMetric (#448): drop any metric that isn't a listed count, and any
 * attribute that isn't the build, the SDK or a listed value. That removes the
 * user the SDK copies onto every metric, even the shared one. Exported for
 * unit testing.
 */
export function filterMetric<M extends { name: string; attributes?: Record<string, unknown> }>(
  metric: M,
): M | null {
  const allowed = FEATURE_COUNTS[metric.name];
  if (!allowed) return null;
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metric.attributes ?? {})) {
    if (SDK_METRIC_ATTRIBUTES.has(key)) {
      attributes[key] = value;
    } else if (typeof value === 'string' && allowed[key]?.includes(value)) {
      attributes[key] = value;
    }
  }
  return { ...metric, attributes };
}

/** True only when we had a DSN and called Sentry.init() – use to show "not configured" in Diagnostics. */
let sentryInitialized = false;

/**
 * React Navigation integration instance — created once so the root layout can call
 * `registerNavigationContainer()` on it after the navigation ref is ready.
 */
export const navigationIntegration =
  Platform.OS !== 'web'
    ? reactNavigationIntegration({ enableTimeToInitialDisplay: true })
    : undefined;

/**
 * Whether Sentry was initialized with a DSN in this build (for Diagnostics UI).
 */
export function isSentryConfigured(): boolean {
  return sentryInitialized;
}

/**
 * Initialize Sentry
 * Call this early in app lifecycle (in app/_layout.tsx before first render)
 */
export function initSentry(): void {
  // Skip Sentry initialization on web (Sentry React Native doesn't support web)
  if (Platform.OS === 'web') {
    return;
  }

  // Capture builds (#396) are for screenshots; their crashes are not the app's.
  if (CAPTURE_MODE) {
    return;
  }

  // DSN: prefer env (Metro inlining), fallback to extra from app.config.js (set at EAS build time).
  // EAS env vars are injected when EAS runs the build; app.config.js reads them and extra is embedded.
  const dsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN ||
    (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)?.sentryDsn ||
    '';

  if (!dsn || dsn.trim() === '') {
    if (__DEV__) {
      console.warn('Sentry DSN not configured. Set EXPO_PUBLIC_SENTRY_DSN (EAS env or .env).');
    }
    return;
  }

  sentryInitialized = true;
  const build = appBuildNumber();
  Sentry.init({
    dsn,
    debug: __DEV__,
    environment: sentryEnvironment(
      __DEV__,
      Device.isDevice,
      (Constants.expoConfig?.extra as { buildProfile?: string } | undefined)?.buildProfile ??
        'local',
    ),
    // Anonymous feature counts (#448). beforeSendMetric keeps only the listed
    // ones; in development nothing is sent, as with events.
    enableMetrics: true,
    beforeSendMetric(metric) {
      return __DEV__ ? null : filterMetric(metric);
    },
    // Off (#444): a session carries the installation ID as its distinct ID.
    // This gives up crash-free rates; every crash is still reported.
    enableAutoSessionTracking: false,
    // The same user on every phone (#444). initialScope covers JavaScript
    // events from the first one; onReady gives the native scope the same user
    // once the native SDK is up, so native events don't get the installation ID.
    initialScope: { user: { ...SHARED_SENTRY_USER } },
    onReady: () => {
      Sentry.setUser({ ...SHARED_SENTRY_USER });
      // Local test builds only (SENTRY_TEST_EVENT=1, #444/#448): one event and
      // one count, to read what reaches Sentry. EAS builds never set it.
      if (
        (Constants.expoConfig?.extra as { sentryTestEvent?: boolean } | undefined)?.sentryTestEvent
      ) {
        Sentry.captureMessage('Sentry test event (#444, #448)', 'info');
        countFeatureUse('edit_plan_opened');
      }
    },
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% of transactions in production
    // Privacy: do not auto-collect IP addresses, cookies, headers, etc.
    // We only want stack traces + technical context strings.
    sendDefaultPii: false,
    // Attach app version and build info
    release: Constants.expoConfig?.version || '1.0.0',
    // Each platform numbers its builds separately, so the dist is this one's.
    dist: build === '?' ? undefined : build,
    beforeSend(event) {
      // In development, log but don't send
      if (__DEV__) {
        console.log(
          'Sentry event (dev mode - not sent):',
          event.exception?.values?.[0]?.value ?? event.message,
        );
        return null;
      }

      // Defense-in-depth: scrub any sensitive user-data keys that may have
      // accidentally been passed via captureError(extra). Callers should not
      // pass user data in the first place — see PII_KEYS above for the list.
      if (event.extra) {
        event.extra = scrubExtra(event.extra);
      }
      // contexts.extra is another path Sentry merges into events
      if (event.contexts?.extra) {
        event.contexts.extra = scrubExtra(event.contexts.extra as Record<string, unknown>);
      }

      return anonymizeEvent(event);
    },
    beforeSendTransaction(event) {
      return anonymizeEvent(event);
    },
    // Sanitize breadcrumbs before they're recorded. beforeSend only scrubs
    // event.extra; touch (ui.click) and console breadcrumbs are a separate path
    // that can carry user data (e.g. a trigger-chip accessibilityLabel). See
    // scrubBreadcrumb above.
    beforeBreadcrumb(breadcrumb) {
      return scrubBreadcrumb(breadcrumb);
    },
    // Default integrations (ANR detection, app start, native crashes) are
    // included automatically. Screenshots are NOT attached (attachScreenshot
    // defaults to false and we do not enable it) and Session Replay is off —
    // deliberate for a health app. We add React Navigation tracking on top.
    integrations: navigationIntegration ? [navigationIntegration] : [],
  });
}

/**
 * Count that a feature was used (#448). The names are a fixed list
 * (FEATURE_COUNTS), and a count carries nothing from the person's log.
 */
export function countFeatureUse(name: 'log_entry_saved' | 'edit_plan_opened'): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }
  Sentry.metrics.count(name, 1);
}

/**
 * Log an error to Sentry
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log a message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Test Sentry integration by sending a test error
 * Use this to verify that Sentry is working correctly
 */
export function testSentry(): void {
  if (Platform.OS === 'web') {
    if (__DEV__) {
      console.log('Sentry test skipped (web platform)');
    }
    return;
  }
  if (!sentryInitialized) {
    if (__DEV__) {
      console.warn('Sentry test skipped (DSN not configured)');
    }
    return;
  }

  try {
    // Send a test message
    captureMessage('Sentry test message - integration working!', 'info');

    // Send a test error
    const testError = new Error('Sentry test error - this is intentional');
    captureError(testError, {
      context: 'sentry_test',
      timestamp: Date.now(),
    });

    if (__DEV__) {
      console.log('✅ Sentry test completed! Check your Sentry dashboard for the test events.');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('❌ Sentry test failed:', error);
    }
  }
}

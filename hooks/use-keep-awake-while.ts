import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

/**
 * Keep the screen on while `active` is true, and hand it back to Auto-Lock
 * when it turns false or the screen unmounts (#353).
 *
 * The guided tools need no touch once they start, so Auto-Lock (as short as
 * 30 seconds) would lock the phone mid-session, and iOS pauses JavaScript
 * timers until it is unlocked.
 */
export function useKeepAwakeWhile(active: boolean, tag: string) {
  useEffect(() => {
    if (!active) return;
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [active, tag]);
}

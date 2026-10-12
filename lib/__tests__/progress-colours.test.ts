/**
 * A day above its plan is met with calm (#398): Progress shows it in a tint of
 * the accent, never in the error colour, in either appearance.
 */
import { abovePlanColor } from '@/components/progress/progress-styles';
import { getColors } from '@/lib/design';

describe('abovePlanColor', () => {
  it.each(['light', 'dark'] as const)(
    'is a tint of the accent in %s mode, not the error colour',
    (mode) => {
      const colors = getColors(mode);
      const colour = abovePlanColor(colors);
      expect(colour.toLowerCase()).not.toContain(colors.error.toLowerCase());
      expect(colour.toLowerCase().startsWith(colors.primary.toLowerCase())).toBe(true);
      expect(colour).toMatch(/^#[0-9a-f]{8}$/i);
    },
  );
});

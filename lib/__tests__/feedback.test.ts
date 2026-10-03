/**
 * Tests for the Send feedback mail link (#357).
 *
 * The link must reach support@iamjarl.com with the subject and versions
 * readable once decoded, and must survive characters that would otherwise
 * break a mailto URL.
 */

import { buildFeedbackMailto, SUPPORT_EMAIL } from '../feedback';

function parse(mailto: string) {
  const [address, query] = mailto.replace(/^mailto:/, '').split('?');
  const params = new URLSearchParams(query);
  return { address, subject: params.get('subject'), body: params.get('body') };
}

describe('buildFeedbackMailto', () => {
  it('addresses support with the version in the subject', () => {
    const { address, subject } = parse(buildFeedbackMailto('1.6.2', '24', '26.0'));
    expect(address).toBe(SUPPORT_EMAIL);
    expect(subject).toBe('Wean Nicotine 1.6.2 feedback');
  });

  it('puts the app version, build and iOS version in the body, below room to write', () => {
    const { body } = parse(buildFeedbackMailto('1.6.2', '24', '26.0'));
    expect(body).toMatch(/^\n\n\n/);
    expect(body).toContain('App: Wean Nicotine 1.6.2 (build 24)');
    expect(body).toContain('iOS: 26.0');
  });

  it('encodes characters that would break the URL', () => {
    const mailto = buildFeedbackMailto('1.6.2&x=1', '24', '26.0 #beta');
    expect(mailto).not.toMatch(/[ #\n]/);
    const { subject, body } = parse(mailto);
    expect(subject).toBe('Wean Nicotine 1.6.2&x=1 feedback');
    expect(body).toContain('iOS: 26.0 #beta');
  });
});

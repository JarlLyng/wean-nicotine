export const SITE_NAME = 'Taper';
export const SITE_URL = 'https://taper.iamjarl.com';

// Until the real link is known, keep the placeholder ID.
export const APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXXXXX';

export const SUPPORT_EMAIL = 'support@iamjarl.com';
export const COMPANY_NAME = 'IAMJARL';

export function isAppStoreUrlKnown(url: string) {
	return Boolean(url) && !url.includes('idXXXXXXXXXX');
}


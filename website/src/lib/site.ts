export const SITE_NAME = 'Wean Nicotine';
export const SITE_URL = 'https://weannicotine.iamjarl.com';
export const SITE_DESCRIPTION = 'Reduce snus and nicotine pouches gradually with a calm, private app.';

export const APP_STORE_URL = 'https://apps.apple.com/app/wean-nicotine/id6758867485';

export const SUPPORT_EMAIL = 'support@iamjarl.com';
export const COMPANY_NAME = 'IAMJARL';

export function isAppStoreUrlKnown(url: string) {
	return Boolean(url) && !url.includes('idXXXXXXXXXX');
}

export function getCampaignAppStoreUrl(campaignToken?: string, providerToken: string = '1111l4fWe') {
	let url = APP_STORE_URL;
	if (campaignToken && isAppStoreUrlKnown(url)) {
		const separator = url.includes('?') ? '&' : '?';
		url += `${separator}pt=${providerToken}&ct=${campaignToken}`;
	}
	return url;
}

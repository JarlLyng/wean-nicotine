export const SITE_NAME = 'Wean Nicotine';
export const SITE_URL = 'https://weannicotine.iamjarl.com';
export const SITE_DESCRIPTION =
  'Reduce snus and nicotine pouches gradually with a calm, private app.';

export const APP_STORE_LISTING_URL = 'https://apps.apple.com/app/wean-nicotine/id6758867485';

// Every App Store link carries Apple campaign parameters so App Store Connect
// can attribute visits and downloads to this site (#366). One campaign for the
// whole site: Apple only shows a campaign once it has 5 first-time downloads,
// so per-page campaigns would never appear. Placement is measured by the
// app-store-click event instead. pt is the account's provider token, mt=8 an
// iPhone app.
export const APP_STORE_URL = `${APP_STORE_LISTING_URL}?pt=128512007&ct=site&mt=8`;

export const SUPPORT_EMAIL = 'support@iamjarl.com';
export const COMPANY_NAME = 'IAMJARL';

export function isAppStoreUrlKnown(url: string) {
  return Boolean(url) && !url.includes('idXXXXXXXXXX');
}

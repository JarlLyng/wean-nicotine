/**
 * Expo config plugin: add Apple PrivacyInfo.xcprivacy to iOS project.
 * Required for App Store (required reason APIs / privacy manifest).
 */
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const PRIVACY_MANIFEST_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSPrivacyTracking</key>
	<false/>
	<key>NSPrivacyCollectedDataTypes</key>
	<array/>
	<key>NSPrivacyAccessedAPITypes</key>
	<array>
		<dict>
			<key>NSPrivacyAccessedAPIType</key>
			<string>NSPrivacyAccessedAPICategoryUserDefaults</string>
			<key>NSPrivacyAccessedAPITypeReasons</key>
			<array>
				<string>CA92.1</string>
			</array>
		</dict>
		<dict>
			<key>NSPrivacyAccessedAPIType</key>
			<string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
			<key>NSPrivacyAccessedAPITypeReasons</key>
			<array>
				<string>C617.1</string>
			</array>
		</dict>
	</array>
</dict>
</plist>
`;

function withPrivacyManifest(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName || config.slug || 'Taper';
      const dir = path.join(projectRoot, 'ios', projectName);
      if (!fs.existsSync(dir)) {
        return config;
      }
      const filePath = path.join(dir, 'PrivacyInfo.xcprivacy');
      fs.writeFileSync(filePath, PRIVACY_MANIFEST_CONTENT, 'utf8');
      return config;
    },
  ]);
}

module.exports = withPrivacyManifest;

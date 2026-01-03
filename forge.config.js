import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

export default {
  packagerConfig: {
    asar: true,
    name: '27Manufacturing ',
    executableName: '27Manufacturing ',
  },
  rebuildConfig: {},
  makers: [
  {
    name: '@electron-forge/maker-zip',
    platforms: ['darwin', 'win32', 'linux'],
    config: {}
  },
  {
    name: '@electron-forge/maker-squirrel',
    platforms: ['win32'],
    config: {
      name: '27Manufacturing ',
      authors: 'Diamond Polymers',
      description: '27 Manufacturing Management System'
    }
  }
],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'gopalsingh2727',
          name: 'Diamond-Polymers'

        },
        prerelease: false,
        draft: true
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      },
    },
  ],
};

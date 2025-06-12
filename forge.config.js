const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    // Build for multiple architectures
    arch: ['x64', 'arm64'], // For macOS: Intel and Apple Silicon
    // For Windows/Linux, you might want: ['ia32', 'x64']
  },
  rebuildConfig: {},
  makers: [
  {
    name: '@electron-forge/maker-zip',
    config: {}
  },
  {
    name: '@electron-forge/maker-dmg',
    config: {
      name: 'DiamondPolymers'
    }
  },
  {
    name: '@electron-forge/maker-squirrel',
    config: {}
  },
  {
    name: '@electron-forge/maker-deb',
    config: {}
  },
  {
    name: '@electron-forge/maker-rpm',
    config: {}
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
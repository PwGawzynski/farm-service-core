import * as process from 'process';

export default () => ({
  accessTokenExpirationTime: process.env.AccessTokenExpirationTime,
  refreshTokenExpirationTime: process.env.RefreshTokenExpirationTime,
  maxRegisteredDevicesCount: process.env.MaxRegisteredDevicesCount,
  refreshSign: process.env.SecretSign,
  secretSign: process.env.RefreshSign,
});

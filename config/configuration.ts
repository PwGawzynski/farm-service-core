import * as process from 'process';

export default () => ({
  refreshTokenExpirationTime: process.env.RefreshTokenExpirationTime,
  maxRegisteredDevicesCount: process.env.MaxRegisteredDevicesCount,
  refreshSign: process.env.SecretSign,
  secretSign: process.env.RefreshSign,
});

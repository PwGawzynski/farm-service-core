/**
 * This interface represents data stored in Access Token
 * @param userName represents user login
 * @param userId -- userEntity id
 */
export interface AuthTokenPayload {
  userLogin: string;
  userId: string;
}

/**
 * This interface represents response data object used for
 * response on login ask and refresh
 */
export interface AuthToken {
  access_token: string;
  refresh_token: string;
}

/**
 * This interface represents Refresh token payload
 * @param deviceId is used to connect token with specific device, is unique for eah token, is demanding to achieve different token for each device
 * @param refreshTokenId token id stored in db
 */
export interface RefreshTokenPayload extends AuthTokenPayload {
  deviceId: string;
  refreshTokenId: string;
}

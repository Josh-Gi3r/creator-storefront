/**
 * OAuth / OIDC adapter interface.
 *
 * Swap out the implementation in `server/_core/sdk.ts` by replacing the
 * concrete OAuthService class with a class that satisfies this interface.
 *
 * Default adapter: standard OIDC adapter (oidcAdapter)
 * Alternatives: Auth0, Clerk, Keycloak, custom OIDC provider — any standard
 * authorization_code flow that returns an access_token and exposes a userinfo
 * endpoint compatible with the shape below is a drop-in replacement.
 *
 * To plug in a different provider:
 *   1. Implement IOAuthAdapter in a new file under server/adapters/auth/
 *   2. Export your adapter instance
 *   3. Pass it to SDKServer (server/_core/sdk.ts)
 */

export interface OAuthUserInfo {
  /** Stable unique user ID from the identity provider */
  openId: string;
  name: string;
  email?: string | null;
  /** Login method detected (email | google | apple | github | …) */
  loginMethod?: string | null;
}

export interface OAuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  idToken?: string;
}

export interface IOAuthAdapter {
  /**
   * Exchange the authorization code (+ state/redirectUri) for an access token.
   * Called during /api/oauth/callback.
   */
  exchangeCodeForToken(code: string, state: string): Promise<OAuthTokenResponse>;

  /**
   * Fetch user profile from the identity provider using an access token.
   */
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;

  /**
   * Verify a session JWT (stored in cookie) and return the embedded user claims,
   * or null if the token is invalid / expired.
   * Implementations that rely on an external session store (e.g. database) can
   * call getUserInfoWithJwt instead.
   */
  verifySession(cookieValue: string | undefined | null): Promise<{
    openId: string;
    name: string;
  } | null>;
}

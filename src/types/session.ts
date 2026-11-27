export type TokenPair = {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
};

export type SessionUser = {
  email: string;
  name: string;
  picture?: string;
};

export type WebSession = {
  accessToken: string;
  expiresAt: number;
  user: SessionUser;
};

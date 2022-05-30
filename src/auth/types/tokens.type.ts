export type TTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TDecodedToken = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

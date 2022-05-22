export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type DecodedToken = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

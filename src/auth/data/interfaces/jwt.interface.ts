export interface JwtPayload {
  name: string;
  token: string;
}

export interface JwtTokenModel {
  name: string;
  password: string;
  iat: number | Date;
  exp: number | Date;
}

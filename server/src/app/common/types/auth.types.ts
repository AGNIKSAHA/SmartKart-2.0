export type UserRole = "shopkeeper" | "consumer";

export interface JwtPayloadBase {
  sub: string;
  role: UserRole;
  email: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  expiresAt: number;
  revoked: boolean;
}

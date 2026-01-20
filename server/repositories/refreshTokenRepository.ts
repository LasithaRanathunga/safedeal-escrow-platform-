import db from "../db/db";

export async function createRefreshToken(
  token: string,
  userId: number,
  expiresAt: Date,
) {
  const refreshToken = await db.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return refreshToken;
}

export async function getRefreshToken(token: string) {
  const refreshToken = await db.refreshToken.findUnique({
    where: {
      token: token,
    },
  });

  return refreshToken;
}

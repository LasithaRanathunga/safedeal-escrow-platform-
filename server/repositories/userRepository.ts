import db from "../db/db";

export async function createUser(
  email: string,
  name: string,
  password: string,
) {
  const user = await db.user.create({
    data: {
      email: email,
      name: name,
      password: password,
    },
  });

  return user;
}

export async function getUserByEmail(email: string) {
  const userData = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  return userData;
}

export async function getUserById(id: number) {
  const user = await db.user.findUnique({
    where: { id: id },
  });

  return user;
}

export async function deleteManyTokensOfUserId(userId: number) {
  await db.refreshToken.deleteMany({ where: { userId: userId } });
}

export async function getUserByName(name: string) {
  const users = await db.user.findMany({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
  });

  return users;
}

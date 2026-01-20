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

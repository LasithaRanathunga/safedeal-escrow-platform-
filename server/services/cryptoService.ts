import bcrypt from "bcrypt";

export async function hashPassword(password: string, saltRounds: number) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

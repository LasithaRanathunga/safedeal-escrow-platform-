import db from "./db/db";

async function ifRefrechTokenExists(token: string) {
  // check if refresh token exists in the database
  const refreshToken = await db.refreshToken.findUnique({
    where: {
      token: token,
    },
  });

  return refreshToken ? true : false;
}

ifRefrechTokenExists(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2FtbSIsIVtYWlsIjoic2FtbUBnbWFpbC5jb20iLCJpYXQiOjE3NTY0NjQ3OTQsImV4cCI6MTc1NzA2OTU5NH0.vtEetNNGIbjyzMR07BLPmOoOwWMbTqZYD7XQHn1YZmI"
).then((exists) => {
  console.log("Token exists:", exists);
});

class AuthRepository {
  constructor(users) {
    this.users = users;
  }

  getUserByUniqueValue(email) {
    return this.users.find((user) => user.email === email);
  }
}

export { AuthRepository };

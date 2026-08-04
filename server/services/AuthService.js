const bcrypt = require("bcrypt");
const User = require("../model/User");

class AuthService {
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async login(username, password) {
    try {

      const user = await User.findOne({
        where: { USERNAME: username },
      });

      if (!user) {
        throw new Error("Invalid username");
      }

     
      const hashedPassword = user.PASSWORD || user.password;
      const isPasswordValid = await this.verifyPassword(
        password,
        hashedPassword,
      );

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }
     
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();

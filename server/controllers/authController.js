const AuthService = require("../services/AuthService");

class authController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

    
      const user = await AuthService.login(username, password);
      
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user.ID_USER || user.id,
          username: user.USERNAME || user.username,
          firstName: user.FIRST_NAME || user.firstName,
          lastName: user.LAST_NAME || user.lastName,
          role: user.role || user.ROLE,
        },
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const result = await AuthService.logout(req.body);
      return res
        .status(200)
        .json({ success: true, message: "Logout successful", data: result });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = authController;

import { getCurrentUser, loginUser, registerUser } from "../../services/auth.service";

export const AuthService = {
  registerUser,
  loginUser,
  getCurrentUser,
};

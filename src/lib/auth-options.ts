import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const authOptions = {
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
  },
  plugins: [admin(), nextCookies()],
};

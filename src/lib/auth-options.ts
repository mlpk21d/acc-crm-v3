import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const authOptions = {
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
  },
  plugins: [admin(), nextCookies()],
};

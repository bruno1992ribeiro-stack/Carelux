import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        console.log("=== AUTHORIZE ===");
        console.log(credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log("Sem credenciais");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        console.log("USER:", user);

        if (!user) {
          console.log("Utilizador não encontrado");
          return null;
        }

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log("PASSWORD OK:", validPassword);

        if (!validPassword) {
          return null;
        }

        console.log("LOGIN OK");

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
};

export default authConfig;
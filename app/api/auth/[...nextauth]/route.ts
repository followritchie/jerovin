import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/app/lib/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const existing = await db.query(
          "SELECT id, phone FROM customers WHERE email=$1",
          [user.email]
        );
        if (existing.rows.length === 0) {
          await db.query(
            "INSERT INTO customers (name, email, created_at) VALUES ($1,$2,NOW())",
            [user.name, user.email]
          );
        }
        return true;
      } catch (err) {
        console.error("Google sign-in DB error:", err);
        return true;
      }
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/account",
  },
});

export { handler as GET, handler as POST };

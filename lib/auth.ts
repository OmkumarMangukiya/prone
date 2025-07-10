import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prismaClient";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Invalid credentials");
                }

                // Check password
                const isValidPassword = await bcrypt.compare(credentials.password, user.password);

                if (!isValidPassword) {
                    throw new Error("Invalid credentials");
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error("Please verify your email before signing in");
                }

                // Return user data (excluding password)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.avatar,
                    emailVerified: user.emailVerified,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.emailVerified = user.emailVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.emailVerified = token.emailVerified;
            }
            return session;
        },
    },
    pages: {
        signIn: "/signin",
        error: "/signin", 
    },
    secret: process.env.NEXTAUTH_SECRET,
};

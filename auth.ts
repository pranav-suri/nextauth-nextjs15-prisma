import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma/prisma";
import Github from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ActionType } from "@prisma/client";
import { createAuditLog } from "./src/lib/audit-logs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: "jwt" },
    adapter: PrismaAdapter(prisma),
    providers: [
        Github,
        CredentialsProvider({
            name: "Email",
            id: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: String(credentials.email),
                    },
                });

                if (
                    !user ||
                    !(await bcrypt.compare(
                        String(credentials.password),
                        user.password!
                    ))
                ) {
                    return null;
                }

                // Log successful login
                await createAuditLog({
                    actionType: ActionType.LOGIN,
                    entityType: "User",
                    entityId: user.id,
                    description: `User '${user.name}' (${user.email}) logged in`,
                    userId: user.id,
                    userEntityId: user.id,
                }).catch((err) =>
                    console.error("Failed to log login event:", err)
                );

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    randomKey: "Hey cool",
                };
            },
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            // const paths = ["/profile", "/client-side"];
            const paths = ["/"];
            const isProtected = paths.some((path) =>
                nextUrl.pathname.startsWith(path)
            );

            if (isProtected && !isLoggedIn) {
                const redirectUrl = new URL("/api/auth/signin", nextUrl.origin);
                redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
                return Response.redirect(redirectUrl);
            }
            return true;
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as unknown as any;
                return {
                    ...token,
                    id: u.id,
                    role: u.role,
                    randomKey: u.randomKey,
                };
            }
            return token;
        },
        session(params) {
            return {
                ...params.session,
                user: {
                    ...params.session.user,
                    id: params.token.id as string,
                    role: params.token.role,
                    randomKey: params.token.randomKey,
                },
            };
        },
    },
});

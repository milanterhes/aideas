import { db } from "@/server/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";


const authOptions: AuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
    ],
    adapter: DrizzleAdapter(db),
    callbacks: {
        session({ session, user }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                },
            };
        },
    },
};

export default authOptions;
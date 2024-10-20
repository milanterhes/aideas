import { db } from "@/server/db";
import { trackEvent } from "@/server/posthog-client";
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
    events: {
        signIn(message) {
            trackEvent({
                event: 'sign_in',
                properties: { message },
                distinctId: message.user.id,
            })
            if (message.isNewUser) {
                const { name, id } = message.user
                trackEvent({
                    event: 'user_created',
                    properties: { name, id },
                    distinctId: id,
                })
            }
        },
    }
};

export default authOptions;
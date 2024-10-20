import { PostHog } from 'posthog-node'

let posthogClient: PostHog | undefined = undefined;

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, { host: 'https://app.posthog.com' });
}

export function trackEvent(message: Parameters<PostHog['capture']>[0]) {
    if (posthogClient) {
        posthogClient.capture(message);
    }
}
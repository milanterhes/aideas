import { Chat } from "@/components/chat";
import authOptions from "@/lib/auth-options";
import { db } from "@/server/db";
import { savedIdeas } from "@/server/schema";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

export default async function Home() {
  const queryClient = new QueryClient();
  const session = await getServerSession(authOptions);
  if (session) {
    const ideas = await db.select().from(savedIdeas).where(eq(savedIdeas.userId, session.user.id))
    await queryClient.prefetchQuery({
      queryKey: ['ideas'],
      queryFn: () => {
        return ideas
      },
    })
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Chat />
    </HydrationBoundary>
  );
}

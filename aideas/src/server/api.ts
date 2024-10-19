import authOptions from '@/lib/auth-options'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { db } from './db'
import { savedIdeas } from './schema'
import { swaggerUI } from '@hono/swagger-ui'


const app = new OpenAPIHono()

const IdeaShema = z.object({
    id: z.string(),
    idea: z.string(),
    context: z.string(),
}).openapi({
    description: 'Idea',
})

const getIdeasRoute = createRoute({
    method: 'get',
    path: '/api/ideas',
    description: 'Get list of ideas',
    responses: {
        200: {
            description: 'List of ideas',
            content: {
                "application/json": {
                    schema: z.array(IdeaShema).openapi({ description: 'List of ideas' }),
                }
            }
        },
        401: {
            description: 'Unauthorized'
        },
    },
})

app.openapi(getIdeasRoute, async (c) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return c.text('Unauthorized', { status: 401 })
    }

    const ideas = await db.select().from(savedIdeas).where(eq(savedIdeas.userId, session.user.id));

    return c.json(ideas, { status: 200 });
})

const addIdeasRoute = createRoute({
    method: 'post',
    path: '/api/ideas',
    description: 'Add a number of ideas',
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.array(IdeaShema.omit({ id: true })).openapi({ description: 'List of new ideas' })
                }
            }
        }
    },
    responses: {
        201: {
            description: 'Idea created',
            content: {
                "application/json": {
                    schema: z.array(IdeaShema).openapi({ description: 'List of new ideas' }),
                }
            }
        },
        401: {
            description: 'Unauthorized'
        },
    }
})

app.openapi(addIdeasRoute, async (c) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return c.text('Unauthorized', { status: 401 })
    }

    const ideas = c.req.valid("json")

    const result = await db.insert(savedIdeas).values(ideas.map(idea => ({ ...idea, userId: session.user.id }))).returning();

    return c.json(result, { status: 201 });
})

const resetIdeasRoute = createRoute({
    method: 'delete',
    path: '/api/ideas',
    description: 'Reset ideas',
    responses: {
        200: {
            description: 'Ideas reset'
        },
        401: {
            description: 'Unauthorized'
        },
    },
})

app.openapi(resetIdeasRoute, async (c) => {
    const session = await getServerSession(authOptions);
    if (!session) {
        return c.text('Unauthorized', { status: 401 })
    }

    await db.delete(savedIdeas).where(eq(savedIdeas.userId, session.user.id));

    return c.text('', { status: 200 });
})

app.doc('/api/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'AIdeas API',
    },
})

app.get('/api/ui', swaggerUI({ url: '/api/doc' }))

app.notFound(async (c) => {
    return c.text('Route not found', { status: 404 })
})

export default app;
# AIdeas

## https://aideas-nine.vercel.app/

### AIdeas is a chatbot that helps you generate and save ideas.

#### Design decisions

- NextJS was chosen as the base because it is super easy to get started with
- The OpenAI SDK is used to interface with the AI model
- Hono is used as the backend framework. It can be integrated into NextJS, while still having the possibility to be run elsewhere without changing much code. OpenAPI is used to define the API. The swagger UI is available at `http://localhost:3000/api/ui`
- Bun was chosen as package manager because of it's speed
- Turso because it's a fast and easy to use database

Running locally:

`touch .env.local` then fill it out using the example (Posthog keys are optional)

`bun install`

`bun migrate` this creates the local database file

`bun dev`

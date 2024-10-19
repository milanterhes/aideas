import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
    path: ".env.local",
});

const databaseUrl = process.env.DATABASE_URL;
const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN;

if (!databaseUrl || !databaseAuthToken) {
    throw new Error("DATABASE_URL and DATABASE_AUTH_TOKEN must be set");
}

export default defineConfig({
    dialect: "turso",
    dbCredentials: {
        url: databaseUrl,
        authToken: databaseAuthToken,
    },
    schema: "src/server/schema.ts",
    strict: true,
    verbose: true,
    out: "./migrations-prod",
});

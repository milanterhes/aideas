import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    dbCredentials: {
        url: "file:local.db",
    },
    schema: "src/server/schema.ts",
    strict: true,
    verbose: true,
    out: "./migrations",
});
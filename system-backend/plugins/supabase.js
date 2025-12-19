import fastifyPlugin from "fastify-plugin";
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const supaConnection = fastifyPlugin(async (fastify, options) => {
    try {
        const connString = process.env.DATABASE_URL;
        const client = await postgres(connString);
        const db = drizzle(client);
        fastify.decorate("dbConnection", db);
        fastify.log.info("Connected to Supabase successfully");

    } catch (error) {
        fastify.log.error(`Error occured while connecting to supabase : ${error}`)
        process.exit(1)
    }


})
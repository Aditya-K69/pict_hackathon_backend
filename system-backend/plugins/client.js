import { createClient } from "@supabase/supabase-js";
import fastifyPlugin from "fastify-plugin";

export const supaClient = fastifyPlugin(async (fastify) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_API_KEY // service role key
    );

    // decorate with the CLIENT, not the plugin
    fastify.decorate("supabase", supabase);

  } catch (error) {
    fastify.log.error(`Error creating Supabase client: ${error}`);
    process.exit(1);
  }
});

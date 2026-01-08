import fp from "fastify-plugin";

export default fp(async function authPlugin(fastify) {
  fastify.decorate("authenticate", async (request, reply) => {
    try {
      const payload = await request.jwtVerify();

      // overwrite safely (no decoration)
      request.user = {
        id: Number(payload.sub)
      };
    } catch {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });
});

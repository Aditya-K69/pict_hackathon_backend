import {
  registerUser,
  loginUser,
  forgotPIN,
  authOTP,
  resetPIN,
  mapCompanies,
  listUsers,
  listMapping,
  uploadFile
} from "../controllers/userController.js";

export default async function userRouter(fastify) {

  // ---------- AUTH / USER ----------

  fastify.post("/register", {
    schema: {
      body: {
        type: "object",
        required: ["name", "phone_number", "email", "pin"],
        additionalProperties: false,
        properties: {
          name: { type: "string", minLength: 1 },
          phone_number: { type: "string", minLength: 10, maxLength: 16 },
          email: { type: "string", format: "email" },
          pin: { type: "string", pattern: "^[0-9]{6}$" }
        }
      }
    }
  }, registerUser);

  fastify.post("/login", {
    schema: {
      body: {
        type: "object",
        required: ["phone_number", "pin"],
        additionalProperties: false,
        properties: {
          phone_number: { type: "string", minLength: 10, maxLength: 16 },
          pin: { type: "string", pattern: "^[0-9]{6}$" }
        }
      },
      response: {
        200: {
          type: "object",
          properties: {
            access_token: { type: "string" }
          }
        }
      }
    }
  }, loginUser);

  fastify.post("/forgotPIN", {
    schema: {
      body: {
        type: "object",
        required: ["email"],
        additionalProperties: false,
        properties: {
          email: { type: "string", format: "email" }
        }
      }
    }
  }, forgotPIN);

  fastify.post("/authOTP", {
    schema: {
      body: {
        type: "object",
        required: ["otp", "email"],
        additionalProperties: false,
        properties: {
          otp: { type: "string" },
          email: { type: "string", format: "email" }
        }
      }
    }
  }, authOTP);

  fastify.post("/resetPIN", {
    schema: {
      body: {
        type: "object",
        required: ["reset_token", "new_pin"],
        additionalProperties: false,
        properties: {
          reset_token: { type: "string" },
          new_pin: { type: "string" }
        }
      }
    }
  }, resetPIN);

  // ---------- COMPANY ----------

  fastify.post("/addcompany", {
    schema: {
      body: {
        type: "object",
        required: ["id", "company_name"],
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          company_name: { type: "string" }
        }
      }
    }
  }, mapCompanies);

  fastify.get("/getall", listUsers);
  fastify.get("/getmappings", listMapping);


  fastify.post(
    "/upload",
    {
      preHandler: fastify.authenticate
      // DO NOT add body schema here (multipart)
    },
    uploadFile
  );
}

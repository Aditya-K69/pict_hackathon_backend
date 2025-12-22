import { registerUser,loginUser } from "../controllers/userController.js";

export default async function userRouter(fastify) {
    
    fastify.post('/register',{

        schema:{
            body:{
                type: 'object',
                required: ['name','phone_number','email','pin'],
                additionalProperties: false,
                properties:{
                    name:{
                        type: 'string',
                        minLength: 1
                    },  
                    phone_number:{
                        type:'string',
                        minLength:10,
                        maxLength:16
                    },
                    email:{
                        type:'string',
                        format:'email'
                    },
                    pin:{
                        type:'string',
                        pattern: '^[0-9]{6}$'
                    }

                }
            }
        },
        response:{
            201:{
                type:"object",
                properties:{
                    success:{
                        type:'boolean'
                    }
                }
            }
        }
    } , registerUser)    


 fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['phone_number', 'pin'],
        additionalProperties: false,
        properties: {
          phone_number: {
            type: 'string',
            minLength: 10,
            maxLength: 16
          },
          pin: {
            type: 'string',
            pattern: '^[0-9]{6}$'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            access_token: { type: 'string' }
          }
        }
      }
    }
  }, loginUser)

}
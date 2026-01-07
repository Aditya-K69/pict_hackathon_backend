// prebuilt plugins ahet ithe
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import fastifySensible from '@fastify/sensible'
import fastifyJwt from '@fastify/jwt'


//these are custom built plugins
import {supaConnection} from './plugins/supabase.js'
import {mail_service} from './plugins/nodemailer.js'
import userRouter from './routes/userRouter.js'
import companyRouter from './routes/companyRouter.js'


//actual fastify initialization, pre built plugin registration
const fastify = Fastify({
  logger: true
})
await fastify.register(cors,{
    origin:"http://localhost:5173"
})
await fastify.register(fastifyEnv,{
    dotenv:true,
    schema:{
        type: "object",
        required: ["PORT","DATABASE_URL"],
        properties: {
            PORT: {
                type:"string",
                default:4000
            },
            DATABASE_URL: {
                type:"string",

            }
        } 
    }
})
await fastify.register(fastifySensible)
await fastify.register(fastifyJwt,{secret:process.env.JWT_SECRET})


// custom plugin registration
await fastify.register(supaConnection)
await fastify.register(mail_service)
await fastify.register(userRouter,{prefix:'/users'})
await fastify.register(companyRouter,{prefix:'/companies'})

// start server
const startServer = async()=>{
try {    
    await fastify.listen({
        port : process.env.PORT
    })
} catch (error) {
    fastify.log.error(`Error occured while starting the server : ${error}`)
}
}

//database testing route
fastify.get('/testdb',async (req,res) => {
    try {
        
        const result = await fastify.dbConnection.execute('select 1 as alive')
        res.status(201).send({success:true,data:result})

    } catch (error) {
        fastify.log.error(`Error connecting to Supabase : ${error}`)
        res.status(500).send({error:`Error occurred while connecting to Supabase`})
    }
})



startServer()
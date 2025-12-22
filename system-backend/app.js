import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import fastifySensible from '@fastify/sensible'
import {supaConnection} from './plugins/supabase.js'
import fastifyJwt from '@fastify/jwt'
import userRouter from './routes/userRouter.js'

const fastify = Fastify({
  logger: true
})
await fastify.register(cors,{
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
await fastify.register(supaConnection)
await fastify.register(fastifyJwt,{secret:process.env.JWT_SECRET})
await fastify.register(userRouter,{prefix:'/users'})




const startServer = async()=>{
try {    
    await fastify.listen({
        port: process.env.PORT
    })
} catch (error) {
    fastify.log.error(`Error occured while starting the server : ${error}`)
}
}

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
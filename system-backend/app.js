import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyEnv from '@fastify/env'
import fastifySensible from '@fastify/sensible'
import { drizzle } from 'drizzle-orm/node-postgres'

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


const startServer = async()=>{
try {
    
    await fastify.listen({
        port: process.env.PORT
    })



} catch (error) {
    fastify.log.error(`Error occured while starting the server : ${error}`)
    
}
}

fastify.get("/check",function(req,res){
    res.send({
        message:"Check done"
    })
})

fastify.get('/checkDBconnect',async function(req,res){
    const db = drizzle(process.env.DATABASE_URL);
    const result = await db.execute('select 1')
    res.send({
        code:200,
        message:"success",
        data:result
    })
})

startServer()
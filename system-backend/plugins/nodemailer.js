import fastifyPlugin from "fastify-plugin";
import nodemailer from "nodemailer"

export const mail_service = fastifyPlugin(async(fastify,options)=>{
    
    const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: "elisa.lockman@ethereal.email",
        pass: "7nJUV9DMA6qAqZUPmk",
    },    
});

    fastify.decorate("mailer",transporter)



})
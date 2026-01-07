import fastifyPlugin from "fastify-plugin";
import nodemailer from "nodemailer"

export const mail_service = fastifyPlugin(async(fastify,options)=>{
    
    const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: "eve.haag@ethereal.email",
        pass: "7GS9eBn5p88ZDzTWPD",
    },    
});

    fastify.decorate("mailer",transporter)



})
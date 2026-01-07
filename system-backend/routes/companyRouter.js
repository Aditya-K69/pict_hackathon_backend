import {registerCompany,loginCompany,listCompanies} from "../controllers/companyController.js"


export default async function companyRouter(fastify) {
    
    fastify.post('/register',{
             body:{
                type: 'object',
                required: ['company_name','company_email','password'],
                additionalProperties: false,
                properties:{
                    company_name:{
                        type: 'string',
                        minLength: 1
                    },  
                    company_email:{
                        type:'string',
                        format:'email'
                    },
                    password:{
                        type:'string',   
                    }

                }
            }       
    },registerCompany)


    fastify.post('/login',{
             body:{
                type: 'object',
                required: ['company_email','password'],
                additionalProperties: false,
                properties:{ 
                    company_email:{
                        type:'string',
                        format:'email'
                    },
                    password:{
                        type:'string',   
                    }

                }
            }       
    },loginCompany)

fastify.get('/getall',listCompanies)
}
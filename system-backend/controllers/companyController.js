import bcrypt from "bcryptjs";
import { companyTable } from "../database/schema.ts";
import {eq } from "drizzle-orm";


export async function registerCompany(request,reply) {
    const {company_name , company_email, password} = request.body

    if(!company_name || !company_email || !password){
        return reply.code(400).send({
            message:"name , email and password required"
        })
    }

    const pass_hash = await bcrypt.hash(password,12)

    await request.server.dbConnection.insert(companyTable).values({
        company_name,
        company_email,
        password:pass_hash
})

    return reply.code(200).send({
        message:"The Company was registered successfully"
    })

}

export async function loginCompany(request,reply) {
    
    const { company_email , password } = request.body

    const companies = await request.server.dbConnection.select().from(companyTable).where(eq(companyTable.company_email,company_email));
    
    if(companies.length===0){
        return reply.code(400).send({
            message:"The company does not exist"
        })
    }

    const company = companies[0]
    const valid_pass = await bcrypt.compare(password,company.password)

    if(!valid_pass){
        return reply.code(401).send({
            message:"Incorrect password, please try again"
        })
    }

    const token = await request.server.jwt.sign(
        {sub: company.id},
        {expiresIn: process.env.JWT_EXPIRY}
    )

    return reply.code(200).send({
        message:"Login was successful",
        token: token
    })

}

export async function listCompanies(request, reply) {
  const companies = await request.server.dbConnection
    .select({
      id: companyTable.id,
      company_name: companyTable.company_name,
      company_email: companyTable.company_email,
      
    })
    .from(companyTable);

  return reply.code(200).send({ companies });
}
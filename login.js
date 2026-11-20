import bcrypt from "bcryptjs";
import {db,tokenFor,method,fail} from "./_lib.js";
export default async function handler(req,res){
 try{
  method(req,["POST"]); const {email,password}=req.body||{};
  const q=await db().query("SELECT * FROM users WHERE email=$1",[(email||"").trim().toLowerCase()]);
  const u=q.rows[0]; if(!u||!(await bcrypt.compare(password||"",u.password_hash))) return res.status(401).json({error:"Incorrect email or password."});
  return res.json({user:{id:u.id,full_name:u.full_name,email:u.email,role:u.role},token:tokenFor(u)});
 }catch(e){return fail(res,e)}
}
import bcrypt from "bcryptjs";
import {db,tokenFor,method,fail} from "./_lib.js";
export default async function handler(req,res){
 try{
  method(req,["POST"]); const {fullName,email,password}=req.body||{};
  if(!fullName?.trim()||!email?.trim()||!/^.{8,}$/.test(password||"")) return res.status(400).json({error:"Enter your name, email and password (at least 8 characters)."});
  const hash=await bcrypt.hash(password,12);
  const q=await db().query("INSERT INTO users(full_name,email,password_hash) VALUES($1,$2,$3) RETURNING id,full_name,email,role",[fullName.trim(),email.trim().toLowerCase(),hash]);
  return res.status(201).json({user:q.rows[0],token:tokenFor(q.rows[0])});
 }catch(e){return fail(res,e)}
}
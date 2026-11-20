import {db,auth,method,fail} from "./_lib.js";
export default async function handler(req,res){try{
 if(req.method==="GET"){const q=await db().query("SELECT s.id,s.title,s.details,s.amount_needed,s.status,s.created_at,u.full_name FROM support_requests s JOIN users u ON u.id=s.user_id WHERE s.status='open' ORDER BY s.created_at DESC");return res.json({requests:q.rows});}
 method(req,["POST"]);const u=auth(req);const {title,details,amountNeeded}=req.body||{};
 if(!title||!details||Number(amountNeeded)<=0)return res.status(400).json({error:"Add a title, details and amount needed."});
 const q=await db().query("INSERT INTO support_requests(user_id,title,details,amount_needed) VALUES($1,$2,$3,$4) RETURNING *",[u.id,title,details,Number(amountNeeded)]);
 return res.status(201).json({request:q.rows[0],message:"Request submitted for review."});
}catch(e){return fail(res,e)}}
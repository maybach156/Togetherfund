import {db,auth,method,fail} from "./_lib.js";
export default async function handler(req,res){try{
 if(req.method==="GET"){const q=await db().query("SELECT c.*,u.full_name AS creator,(SELECT COUNT(*) FROM circle_members m WHERE m.circle_id=c.id) AS members FROM contribution_circles c JOIN users u ON u.id=c.creator_id WHERE c.status='active' ORDER BY c.created_at DESC");return res.json({circles:q.rows});}
 method(req,["POST"]);const u=auth(req);const {name,amountPerRound,frequency,memberLimit,rules}=req.body||{};
 if(!name||Number(amountPerRound)<=0||!["weekly","monthly"].includes(frequency)||!Number.isInteger(Number(memberLimit))||Number(memberLimit)<2||!rules)return res.status(400).json({error:"Complete all circle details."});
 const q=await db().query("INSERT INTO contribution_circles(creator_id,name,amount_per_round,frequency,member_limit,rules) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",[u.id,name,Number(amountPerRound),frequency,Number(memberLimit),rules]);
 return res.status(201).json({circle:q.rows[0],message:"Circle submitted for admin review. Do not collect money until members have agreed to the rules and the circle is approved."});
}catch(e){return fail(res,e)}}
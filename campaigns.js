import {db,auth,method,fail} from "./_lib.js";
export default async function handler(req,res){
 try{
  if(req.method==="GET"){
   const q=await db().query(`SELECT c.id,c.title,c.description,c.target_amount,c.category,c.created_at,u.full_name,
   COALESCE(SUM(CASE WHEN x.payment_status='paid' THEN x.amount ELSE 0 END),0) AS raised
   FROM campaigns c JOIN users u ON u.id=c.user_id LEFT JOIN contributions x ON x.campaign_id=c.id
   WHERE c.status='active' GROUP BY c.id,u.full_name ORDER BY c.created_at DESC`);
   return res.json({campaigns:q.rows});
  }
  method(req,["POST"]);const u=auth(req);const {title,description,targetAmount,category}=req.body||{};
  if(!title?.trim()||!description?.trim()||!Number.isFinite(Number(targetAmount))||Number(targetAmount)<=0)return res.status(400).json({error:"Provide a title, description and valid target."});
  const q=await db().query("INSERT INTO campaigns(user_id,title,description,target_amount,category) VALUES($1,$2,$3,$4,$5) RETURNING *",[u.id,title.trim(),description.trim(),Number(targetAmount),category||"Community support"]);
  return res.status(201).json({campaign:q.rows[0],message:"Campaign submitted for admin review."});
 }catch(e){return fail(res,e)}
}
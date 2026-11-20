import {db,admin,method,fail} from "./_lib.js";
export default async function handler(req,res){try{const a=admin(req);
 if(req.method==="GET"){
  const [users,campaigns,withdrawals,totals]=await Promise.all([
   db().query("SELECT id,full_name,email,role,created_at FROM users ORDER BY created_at DESC LIMIT 200"),
   db().query("SELECT c.*,u.full_name FROM campaigns c JOIN users u ON u.id=c.user_id ORDER BY c.created_at DESC LIMIT 200"),
   db().query("SELECT w.*,u.full_name,u.email FROM withdrawal_requests w JOIN users u ON u.id=w.user_id ORDER BY w.created_at DESC LIMIT 200"),
   db().query("SELECT COALESCE(SUM(amount),0) AS total_paid FROM contributions WHERE payment_status='paid'")]);
  return res.json({users:users.rows,campaigns:campaigns.rows,withdrawals:withdrawals.rows,totalPaid:totals.rows[0].total_paid});
 }
 method(req,["POST"]);const {type,id,action,note}=req.body||{};
 if(type==="campaign"&&["active","rejected","closed"].includes(action)){
  const q=await db().query("UPDATE campaigns SET status=$1 WHERE id=$2 RETURNING id,status",[action,id]);return res.json({item:q.rows[0]});
 }
 if(type==="withdrawal"&&["approved","rejected","paid"].includes(action)){
  if(action==="paid")return res.status(400).json({error:"Record as paid only after you have completed and independently confirmed the bank transfer."});
  const q=await db().query("UPDATE withdrawal_requests SET status=$1,admin_note=$2,reviewed_at=NOW() WHERE id=$3 AND status='pending' RETURNING id,status",[action,note||null,id]);return res.json({item:q.rows[0]});
 }
 return res.status(400).json({error:"Unsupported admin action."});
}catch(e){return fail(res,e)}}
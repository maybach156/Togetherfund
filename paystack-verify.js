import {db,auth,method,fail} from "./_lib.js";
export default async function handler(req,res){
 try{
  method(req,["POST"]);const u=auth(req);const {reference}=req.body||{};
  if(!reference)return res.status(400).json({error:"Payment reference is required."});
  const q=await db().query("SELECT id,amount,user_id FROM contributions WHERE reference=$1",[reference]);
  const c=q.rows[0];if(!c||String(c.user_id)!==String(u.id))return res.status(404).json({error:"Contribution not found."});
  const r=await fetch("https://api.paystack.co/transaction/verify/"+encodeURIComponent(reference),{headers:{Authorization:"Bearer "+process.env.PAYSTACK_SECRET_KEY}});
  const d=await r.json();if(!r.ok||!d.status)throw new Error(d.message||"Could not verify payment.");
  const tx=d.data;const paid=tx.status==="success"&&Math.round(Number(c.amount)*100)===Number(tx.amount)&&tx.currency==="NGN";
  if(!paid){await db().query("UPDATE contributions SET payment_status='failed' WHERE reference=$1 AND payment_status='pending'",[reference]);return res.status(400).json({error:"Payment is not confirmed as successful."});}
  await db().query("UPDATE contributions SET payment_status='paid',paid_at=NOW() WHERE reference=$1 AND payment_status='pending'",[reference]);
  return res.json({status:"paid",message:"Payment verified successfully."});
 }catch(e){return fail(res,e)}
}
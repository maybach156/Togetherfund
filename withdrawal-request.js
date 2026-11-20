import {db,auth,method,fail} from "./_lib.js";
export default async function handler(req,res){try{method(req,["POST"]);const u=auth(req);const {contributionId,amount,bankName,accountNumber,accountName}=req.body||{};
 if(!contributionId||!Number.isFinite(Number(amount))||Number(amount)<=0||!bankName||!/^\d{10}$/.test(accountNumber||"")||!accountName)return res.status(400).json({error:"Complete all bank details and enter a valid 10-digit Nigerian account number."});
 const c=await db().query("SELECT id,amount,campaign_id FROM contributions WHERE id=$1 AND payment_status='paid'",[contributionId]);if(!c.rowCount)return res.status(404).json({error:"Paid contribution not found."});
 const allocated=await db().query("SELECT COALESCE(SUM(amount),0) AS used FROM withdrawal_requests WHERE contribution_id=$1 AND status IN ('pending','approved','paid')",[contributionId]);
 if(Number(amount)>Number(c.rows[0].amount)-Number(allocated.rows[0].used))return res.status(400).json({error:"Requested amount exceeds the unallocated contribution amount."});
 const owner=await db().query("SELECT user_id FROM campaigns WHERE id=$1",[c.rows[0].campaign_id]);
 if(String(owner.rows[0].user_id)!==String(u.id))return res.status(403).json({error:"Only the campaign owner can request withdrawal."});
 const q=await db().query("INSERT INTO withdrawal_requests(user_id,contribution_id,amount,bank_name,account_number,account_name) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,status,created_at",[u.id,contributionId,Number(amount),bankName,accountNumber,accountName]);
 return res.status(201).json({withdrawal:q.rows[0],message:"Withdrawal request submitted for admin review. No transfer has been made."});
}catch(e){return fail(res,e)}}
import {db,auth,method,fail} from "./_lib.js";
export default async function handler(req,res){try{method(req,["GET"]);const u=auth(req);
 const [contrib,withdrawals]=await Promise.all([
 db().query("SELECT x.id,x.amount,x.payment_status,x.reference,x.created_at,c.title FROM contributions x JOIN campaigns c ON c.id=x.campaign_id WHERE x.user_id=$1 ORDER BY x.created_at DESC LIMIT 100",[u.id]),
 db().query("SELECT id,amount,bank_name,account_number,status,created_at FROM withdrawal_requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",[u.id])]);
 return res.json({contributions:contrib.rows,withdrawals:withdrawals.rows});
}catch(e){return fail(res,e)}}
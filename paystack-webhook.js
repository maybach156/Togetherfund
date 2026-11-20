import {paystackSignature,db} from "./_lib.js";
export const config={api:{bodyParser:false}};
async function rawBody(req){const chunks=[];for await(const c of req)chunks.push(c);return Buffer.concat(chunks);}
export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).end();
 try{
  const raw=await rawBody(req);const sig=req.headers["x-paystack-signature"];
  if(!paystackSignature(raw,sig))return res.status(401).end("Invalid signature");
  const event=JSON.parse(raw.toString("utf8"));
  if(event.event==="charge.success"&&event.data?.reference){
   const ref=event.data.reference;
   await db().query("UPDATE contributions SET payment_status='paid',paid_at=COALESCE(paid_at,NOW()) WHERE reference=$1 AND payment_status='pending' AND ROUND(amount*100)=$2 AND user_id=(SELECT id FROM users WHERE email=$3)",[ref,event.data.amount,event.data.customer?.email]);
  }
  return res.status(200).json({received:true});
 }catch(e){return res.status(200).json({received:true})}
}
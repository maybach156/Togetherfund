import crypto from "node:crypto";
import {db,auth,method,fail,paystack} from "./_lib.js";
export default async function handler(req,res){
 try{
  method(req,["POST"]);const u=auth(req);const {campaignId,amount}=req.body||{};
  const naira=Number(amount);
  if(!Number.isInteger(Number(campaignId))||!Number.isFinite(naira)||naira<100||naira>5000000)return res.status(400).json({error:"Enter a valid campaign and an amount between ₦100 and ₦5,000,000."});
  const c=await db().query("SELECT id FROM campaigns WHERE id=$1 AND status='active'",[campaignId]);
  if(!c.rowCount)return res.status(404).json({error:"Campaign not found or not active."});
  const reference="TF_"+crypto.randomUUID().replaceAll("-","");
  await db().query("INSERT INTO contributions(campaign_id,user_id,amount,reference,payment_status) VALUES($1,$2,$3,$4,'pending')",[campaignId,u.id,naira,reference]);
  const callback=(process.env.APP_URL||"").replace(/\/$/,"")+"/payment-callback.html";
  if(!process.env.APP_URL)return res.status(500).json({error:"APP_URL is missing."});
  const data=await paystack("/transaction/initialize",{email:u.email,amount:Math.round(naira*100),reference,callback_url:callback,metadata:{user_id:u.id,campaign_id:Number(campaignId),platform:"TogetherFund"}});
  return res.status(200).json({authorization_url:data.authorization_url,reference});
 }catch(e){return fail(res,e)}
}
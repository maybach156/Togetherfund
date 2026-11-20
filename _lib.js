import pg from "pg";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
const { Pool } = pg;
let pool;
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing in Vercel environment variables.");
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 5 });
  return pool;
}
export function tokenFor(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ id:user.id, email:user.email, role:user.role }, process.env.JWT_SECRET, { expiresIn:"7d" });
}
export function auth(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) throw Object.assign(new Error("Please log in."),{status:401});
  return jwt.verify(h.slice(7), process.env.JWT_SECRET);
}
export function admin(req) {
  const u = auth(req);
  if (u.role !== "admin") throw Object.assign(new Error("Admin access required."),{status:403});
  return u;
}
export function method(req, allowed) {
  if (!allowed.includes(req.method)) throw Object.assign(new Error("Method not allowed."),{status:405});
}
export function fail(res,e) {
  const status=e.status || (["JsonWebTokenError","TokenExpiredError"].includes(e.name)?401:400);
  return res.status(status).json({error:e.message || "Request failed."});
}
export function paystackSignature(raw, signature) {
  const expected=crypto.createHmac("sha512",process.env.PAYSTACK_SECRET_KEY || "").update(raw).digest("hex");
  return !!signature && crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature));
}
export async function paystack(path, body) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  const r=await fetch("https://api.paystack.co"+path,{
    method:"POST",headers:{"Authorization":`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  const data=await r.json();
  if(!r.ok || !data.status) throw new Error(data.message || "Paystack request failed.");
  return data.data;
}
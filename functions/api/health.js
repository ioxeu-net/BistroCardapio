// functions/api/health.js - teste rápido: https://bistrocardapio.pages.dev/api/health
export async function onRequestGet({ env }) {
  const r = await env.DB.prepare("SELECT COUNT(*) as total FROM menu_items").first();
  return Response.json({ ok: true, db: 'bistro-db', menu_items: r.total });
}

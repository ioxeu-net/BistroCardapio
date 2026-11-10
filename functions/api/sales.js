// functions/api/sales.js
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM sales ORDER BY created_at DESC LIMIT 50").all();
  return Response.json(results.map(s => ({ ...s, items: JSON.parse(s.items_json || '[]'), change: s.change_amount })));
}
export async function onRequestPost({ request, env }) {
  const b = await request.json();
  const id = String(Date.now()).slice(-6);
  for (const it of b.items || []) {
    await env.DB.prepare("UPDATE menu_items SET stock = MAX(0, stock - ?) WHERE id = ?").bind(it.qty, it.id).run();
  }
  await env.DB.prepare("INSERT INTO sales (id, items_json, total, payment, paid, change_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id, JSON.stringify(b.items || []), b.total || 0, b.payment || 'pix', b.paid || b.total || 0, b.change || 0, Date.now()).run();
  return Response.json({ id }, { status: 201 });
}

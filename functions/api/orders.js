// functions/api/orders.js - Cloudflare Pages Functions + D1
// Binding no Pages: Settings > Functions > D1 Bindings > Variable name: DB, D1 database: bistro-db

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100").all();
  const orders = results.map(o => ({ ...o, items: JSON.parse(o.items_json || '[]'), table: o.table_no, customerName: o.customer_name }));
  return Response.json(orders);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const id = String(Date.now()).slice(-6);
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const created_at = Date.now();
  // Baixa estoque
  for (const it of body.items || []) {
    await env.DB.prepare("UPDATE menu_items SET stock = MAX(0, stock - ?) WHERE id = ?").bind(it.qty, it.id).run();
  }
  await env.DB.prepare(
    "INSERT INTO orders (id, type, table_no, status, customer_name, phone, address, code, items_json, subtotal, service, total, created_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.type, body.table || null, body.customerName || '', body.phone || '', body.address || '', code, JSON.stringify(body.items || []), body.subtotal || 0, body.service || 0, body.total || 0, created_at).run();
  return Response.json({ id, code, status: 'pending' }, { status: 201 });
}

export async function onRequestPatch({ request, env }) {
  const { id, status } = await request.json();
  await env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, id).run();
  return Response.json({ ok: true });
}

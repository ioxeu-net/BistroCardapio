// functions/api/menu.js
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare("SELECT * FROM menu_items ORDER BY category, name").all();
  return Response.json(results.map(m => ({ ...m, desc: m.description, active: m.active === 1, minStock: m.min_stock })));
}
export async function onRequestPost({ request, env }) {
  const b = await request.json();
  const r = await env.DB.prepare("INSERT INTO menu_items (name, description, price, category, img, active, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(b.name, b.desc || '', b.price || 0, b.category || 'Geral', b.img || '', b.active ? 1 : 0, b.stock || 0, b.minStock || 5).run();
  return Response.json({ id: r.meta.last_row_id }, { status: 201 });
}

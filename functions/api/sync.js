// functions/api/sync.js - Sincroniza tudo entre site e D1
// GET retorna { restaurant, menu, tables, orders, sales, passwords }
// POST recebe o mesmo objeto e salva tudo no D1
// Binding: DB

function toFrontMenu(r) {
  return { id: r.id, name: r.name, desc: r.description || '', price: r.price || 0, category: r.category || 'Geral', img: r.img || '', active: r.active === 1, stock: r.stock ?? 10, minStock: r.min_stock ?? 5 };
}
function toFrontOrder(r) {
  return { id: String(r.id), type: r.type, table: r.table_no || null, status: r.status, customerName: r.customer_name || '', phone: r.phone || '', address: r.address || '', code: r.code || '', items: JSON.parse(r.items_json || '[]'), subtotal: r.subtotal || 0, service: r.service || 0, total: r.total || 0, createdAt: r.created_at || Date.now() };
}
function toFrontSale(r) {
  return { id: String(r.id), items: JSON.parse(r.items_json || '[]'), total: r.total || 0, payment: r.payment || 'pix', paid: r.paid || 0, change: r.change_amount || 0, createdAt: r.created_at || Date.now(), orderId: r.order_id || r.orderId || undefined, origin: r.origin || undefined };
}

export async function onRequestGet({ env }) {
  const rest = await env.DB.prepare("SELECT * FROM restaurant WHERE id = 1").first();
  const menuRes = await env.DB.prepare("SELECT * FROM menu_items ORDER BY category, name").all();
  const ordersRes = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200").all();
  const salesRes = await env.DB.prepare("SELECT * FROM sales ORDER BY created_at DESC LIMIT 200").all();
  const passRes = await env.DB.prepare("SELECT * FROM passwords").all();
  const tablesRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'tables'").first();
  const closingsRow = await env.DB.prepare("SELECT value FROM settings WHERE key = 'closings'").first();
  let closings = [];
  try { closings = JSON.parse(closingsRow?.value || '[]'); } catch(e) {}
  let tables = [1,2,3,4];
  try { tables = JSON.parse(tablesRow?.value || '[1,2,3,4]'); } catch(e) {}
  const passwords = { admin:'', caixa:'', cozinha:'', entrega:'', estoque:'' };
  for (const p of passRes.results || []) passwords[p.role] = p.password || '';
  return Response.json({
    restaurant: { name: rest?.name || '', whatsapp: rest?.whatsapp || '', cover: rest?.cover || '', message: rest?.message || 'Obrigado pela preferência! Volte sempre.' },
    menu: (menuRes.results || []).map(toFrontMenu),
    tables,
    orders: (ordersRes.results || []).map(toFrontOrder),
    sales: (salesRes.results || []).map(toFrontSale),
    closings,
    passwords
  });
}

export async function onRequestPost({ request, env }) {
  const d = await request.json();
  const stmts = [];
  // restaurant
  stmts.push(env.DB.prepare("INSERT OR REPLACE INTO restaurant (id, name, whatsapp, cover, message) VALUES (1, ?, ?, ?, ?)").bind(d.restaurant?.name || '', (d.restaurant?.whatsapp || '').slice(0,11), d.restaurant?.cover || '', d.restaurant?.message || ''));
  // settings tables + closings
  stmts.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('tables', ?)").bind(JSON.stringify(d.tables || [1,2,3,4])));
  stmts.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('closings', ?)").bind(JSON.stringify(d.closings || [])));
  // passwords
  for (const role of ['admin','caixa','cozinha','entrega','estoque']) {
    stmts.push(env.DB.prepare("INSERT OR REPLACE INTO passwords (role, password) VALUES (?, ?)").bind(role, (d.passwords?.[role] || '').slice(0,12)));
  }
  // menu - limpa e reinsere
  stmts.push(env.DB.prepare("DELETE FROM menu_items"));
  for (const m of d.menu || []) {
    stmts.push(env.DB.prepare("INSERT INTO menu_items (id, name, description, price, category, img, active, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(m.id, m.name, m.desc || '', m.price || 0, m.category || 'Geral', m.img || '', m.active ? 1 : 0, m.stock ?? 10, m.minStock ?? 5));
  }
  // orders
  stmts.push(env.DB.prepare("DELETE FROM orders"));
  for (const o of d.orders || []) {
    stmts.push(env.DB.prepare("INSERT INTO orders (id, type, table_no, status, customer_name, phone, address, code, items_json, subtotal, service, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(String(o.id), o.type, o.table || null, o.status, o.customerName || '', o.phone || '', o.address || '', o.code || '', JSON.stringify(o.items || []), o.subtotal || 0, o.service || 0, o.total || 0, o.createdAt || Date.now()));
  }
  // sales
  stmts.push(env.DB.prepare("DELETE FROM sales"));
  for (const s of d.sales || []) {
    stmts.push(env.DB.prepare("INSERT INTO sales (id, items_json, total, payment, paid, change_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(String(s.id), JSON.stringify(s.items || []), s.total || 0, s.payment || 'pix', s.paid || 0, s.change || 0, s.createdAt || Date.now()));
  }
  // Executa em lotes para não estourar limite
  for (let i = 0; i < stmts.length; i += 50) {
    await env.DB.batch(stmts.slice(i, i+50));
  }
  return Response.json({ ok: true, saved: true });
}

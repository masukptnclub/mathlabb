const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Hanya di serverless!
);

exports.handler = async (event, context) => {
  // Proteksi: hanya admin yang boleh akses (pakai secret dari .env)
  const isAdmin = event.headers['x-admin-secret'] === process.env.ADMIN_SECRET;
  if (!isAdmin) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden' }),
    };
  }

  // List semua user (GET)
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, email, level, is_admin');
    if (error) {
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify(data) };
  }

  // Contoh: Hapus user
  if (event.httpMethod === 'DELETE') {
    const { userId } = JSON.parse(event.body);
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  // Tambahkan endpoint lain sesuai kebutuhan
  return { statusCode: 405, body: 'Method Not Allowed' };
}; 
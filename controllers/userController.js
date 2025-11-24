const pool = require("../config/db");
const crypto = require("crypto");

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

exports.createUserWithApiKey = async (req, res) => {
  const { firstname, lastname, email } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Insert user
    const [userRes] = await conn.query(
      "INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)",
      [firstname, lastname, email]
    );
    const userId = userRes.insertId;

    // 2. Create API Key
    const apiKey = generateKey();
    const outDate = new Date(Date.now() + 7 * 86400000); // +7 hari

    await conn.query(
      "INSERT INTO api_keys (key_value, user_id, out_of_date) VALUES (?, ?, ?)",
      [apiKey, userId, outDate]
    );

    // Jika kolom api_key di users tidak ada, hapus bagian update ini:
    // await conn.query("UPDATE users SET api_key = ? WHERE id = ?", [apiKey, userId]);

    await conn.commit();

    res.json({
      message: "User created with API key",
      user: { id: userId, firstname, lastname, email },
      api_key: { key: apiKey, out_of_date: outDate },
    });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.firstname, u.lastname, u.email, ak.key_value, ak.out_of_date
      FROM users u
      LEFT JOIN api_keys ak ON ak.user_id = u.id
    `);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'winkel.db')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT DEFAULT '',
    description TEXT DEFAULT ''
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerEmail TEXT DEFAULT '',
    customerName TEXT DEFAULT '',
    address TEXT DEFAULT '',
    items TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    trackingCode TEXT DEFAULT '',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

// Seed products if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any
if (productCount.count === 0) {
  const insert = db.prepare('INSERT INTO products (id, name, price, image, description) VALUES (?, ?, ?, ?, ?)')
  insert.run('1', 'LED Werklamp 50W', 29.99, 'https://picsum.photos/seed/ledlamp/400/400', 'Krachtige LED werklamp met 50W, perfect voor garage of werkplaats.')
  insert.run('2', 'Draadloze Earbuds Pro', 39.99, 'https://picsum.photos/seed/earbuds/400/400', 'Actieve ruisonderdrukking, 24 uur speeltijd, waterbestendig.')
  insert.run('3', 'Smart Watch Fitness', 49.99, 'https://picsum.photos/seed/smartwatch/400/400', 'Hartslagmeter, stappenteller, 7 dagen batterijduur.')
}

export default db

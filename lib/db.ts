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
  insert.run('1', 'LED Strip Lights 5m', 19.99, 'https://picsum.photos/seed/ledstrip/400/400', 'Kleurrijke LED strip 5 meter, afstandsbediening, waterbestendig. Perfect voor ambiance in je kamer.')
  insert.run('2', 'Telefoonhouder Universeel', 14.99, 'https://picsum.photos/seed/phoneholder/400/400', 'Flexibele telefoonhouder voor bureau of nachtkastje, geschikt voor alle telefoons.')
  insert.run('3', 'Fitness Tracker Band', 24.99, 'https://picsum.photos/seed/fitnessband/400/400', 'Smart fitness band met stappenteller, hartslagmeter en slaapmonitoring. 7 dagen batterijduur.')
  insert.run('4', 'Wireless Earbuds Pro', 39.99, 'https://picsum.photos/seed/earbuds/400/400', 'Actieve ruisonderdrukking, 24 uur speeltijd, waterbestendig IPX7.')
  insert.run('5', 'Smart Watch Ultra', 49.99, 'https://picsum.photos/seed/smartwatch/400/400', 'Grote touchscreen, GPS, hartslagmeter, 10 dagen batterijduur. Geschikt voor iOS en Android.')
}

export default db

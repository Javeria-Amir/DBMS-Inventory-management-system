const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection -
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dj@v3r!43oI7', 
    database: 'inventory_system'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database as id ' + db.threadId);
});

// TEST API - Get all products
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Add new product API
app.post('/api/products', (req, res) => {
    const { name, description, category, price, stock_quantity } = req.body;
    const sql = 'INSERT INTO products (name, description, category, price, stock_quantity) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [name, description, category, price, stock_quantity], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to add product' });
            return;
        }
        res.json({ message: 'Product added successfully', id: results.insertId });
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Inventory Management System API is working!' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});

// DELETE product API
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE id = ?';
    
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete product' });
            return;
        }
        
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        
        res.json({ message: 'Product deleted successfully' });
    });
});


// GET single product API (for editing)
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE id = ?';
    
    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        if (results.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        
        res.json(results[0]);
    });
});

// UPDATE product API
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, description, category, price, stock_quantity, min_stock_level } = req.body;
    
    const sql = 'UPDATE products SET name = ?, description = ?, category = ?, price = ?, stock_quantity = ?, min_stock_level = ? WHERE id = ?';
    
    db.query(sql, [name, description, category, price, stock_quantity, min_stock_level, productId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update product' });
            return;
        }
        
        if (results.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        
        res.json({ message: 'Product updated successfully' });
    });
});

function editProduct(product) {
    const nameInput = document.getElementById('productName');
    if (nameInput) {
        nameInput.value = product.name;
    } else {
        console.error('Element with ID "productName" not found');
    }
    // Repeat for other fields...
}

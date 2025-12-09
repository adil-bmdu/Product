const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // serve images

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Dummy database
let products = []; // In-memory array

// Routes
// Create product
app.post('/products', upload.single('image'), (req, res) => {
    const { name, price, description } = req.body;
    const product = {
        id: Date.now().toString(),
        name,
        price,
        description,
        image: req.file ? `/uploads/${req.file.filename}` : null
    };
    products.push(product);
    res.json({ message: 'Product created', product });
});

// Update product
app.put('/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    res.json({ message: 'Product updated', product });
});

// Delete product
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    res.json({ message: 'Product deleted' });
});

// Get all products
app.get('/products', (req, res) => {
    res.json(products);
});

// Get single product
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// API base URL
const API_BASE = 'http://localhost:3000/api';

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Fetch and display products
async function loadProducts() {
    try 
    {
        // Show loading animation
        document.getElementById('productsList').innerHTML = `
            <div class="skeleton-loading">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
                </div>
                `;

        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        
        // Small delay to show loading (optional)
        setTimeout(() => {
            displayProducts(products);
            updateDashboard(products);
        }, 300);
        
    }
    catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsList').innerHTML = 
            '<div class="alert alert-danger">Failed to load products. Make sure the backend server is running.</div>';
    }
}

// Display products in the table
function displayProducts(products) 
{
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) 
    {
        productsList.innerHTML = '<p class="text-muted">No products found.</p>';
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    products.forEach(product => {
        const isLowStock = product.stock_quantity <= product.min_stock_level;
        const statusClass = isLowStock ? 'text-danger' : 'text-success';
        const statusText = isLowStock ? 'Low Stock' : 'In Stock';

        html += `
            <tr>
                <td>${product.id}</td>
                <td><strong>${product.name}</strong></td>
                <td>${product.description}</td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td>${product.stock_quantity}</td>
                <td class="${statusClass}"><strong>${statusText}</strong></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    productsList.innerHTML = html;
}

// Update dashboard statistics
function updateDashboard(products) {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.stock_quantity > 0).length;
    const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_level).length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock_quantity), 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('inStock').textContent = inStock;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
}
// Add product form submission
document.getElementById('addProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock_quantity: parseInt(document.getElementById('productStock').value),
        min_stock_level: parseInt(document.getElementById('productMinStock').value)
    };

    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Product added successfully!', 'success');
            clearForm();
            loadProducts(); // Refresh the products list
        } else {
            showMessage('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage('Failed to add product. Please try again.', 'danger');
    }
});

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

// Clear form
function clearForm() {
    document.getElementById('addProductForm').reset();
    document.getElementById('formMessage').innerHTML = '';
}
// Delete product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`${API_BASE}/products/${productId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Product deleted successfully!', 'success');
                loadProducts(); // Refresh the list
            } else {
                showMessage('Error: ' + result.error, 'danger');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showMessage('Failed to delete product.', 'danger');
        }
    }
}

// Edit product - open modal with current data
async function editProduct(productId) {
    try {
        console.log('🔄 Editing product ID:', productId);
        
        const apiUrl = `${API_BASE}/products/${productId}`;
        console.log('📡 Calling API:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('📊 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('✅ Product data received:', product);

        // Fill the form with current product data
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stock_quantity;
        document.getElementById('editProductMinStock').value = product.min_stock_level;

        // Show the modal
        const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        editModal.show();
        
    } catch (error) {
        console.error('❌ Error loading product for edit:', error);
        showMessage('Failed to load product data: ' + error.message, 'danger');
    }
}
// Update product
async function updateProduct() {
    const productId = document.getElementById('editProductId').value;
    
    const productData = {
        name: document.getElementById('editProductName').value,
        description: document.getElementById('editProductDescription').value,
        category: document.getElementById('editProductCategory').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        stock_quantity: parseInt(document.getElementById('editProductStock').value),
        min_stock_level: parseInt(document.getElementById('editProductMinStock').value)
    };

    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage('Product updated successfully!', 'success');
            
            // Close the modal
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            editModal.hide();
            
            // Refresh the products list
            loadProducts();
        } else {
            showMessage('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showMessage('Failed to update product.', 'danger');
    }
}
// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    fetch(`${API_BASE}/products`)
        .then(response => response.json())
        .then(products => {
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
            
            displayProducts(filteredProducts);
            updateDashboard(filteredProducts);
        })
        .catch(error => {
            console.error('Error searching products:', error);
        });
}
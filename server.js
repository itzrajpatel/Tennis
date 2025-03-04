require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MySQL Database Connections
const dbLogin = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_LOGIN,
});

const dbCart = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_CART, // Use a separate cart database
});

// **Register (Signup)**
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        dbLogin.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Username already exists!" });
            }
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user!" });
    }
});

// **Login**
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    dbLogin.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error!" });

        if (results.length === 0) {
            return res.status(401).json({ message: "User not found!" });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, username: user.username });
    });
});

// Add item to cart
app.post("/cart/add", (req, res) => {
    const { username, product_name, price, image, quantity } = req.body;

    // Check if item already exists in the cart
    const checkSQL = "SELECT * FROM cart WHERE username = ? AND product_name = ?";
    dbCart.query(checkSQL, [username, product_name], (err, results) => {
        if (err) return res.status(500).json({ message: "Error checking cart!" });

        if (results.length > 0) {
            return res.status(400).json({ message: "Item already present in cart..." });
        }

        // If item is not present, add it to cart
        const insertSQL = "INSERT INTO cart (username, product_name, price, image, quantity) VALUES (?, ?, ?, ?, ?)";
        dbCart.query(insertSQL, [username, product_name, price, image, quantity], (err, result) => {
            if (err) return res.status(500).json({ message: "Error adding to cart!" });
            res.status(201).json({ message: "Item added to cart!" });
        });
    });
});

// Get cart items for a user
app.get("/cart/:username", (req, res) => {
    const { username } = req.params;
    const sql = "SELECT * FROM cart WHERE username = ?";

    dbCart.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching cart!" });
        res.json(results);
    });
});

// Update item quantity
app.put("/cart/update", (req, res) => {
    const { username, product_name, quantity } = req.body;
    const sql = "UPDATE cart SET quantity = ? WHERE username = ? AND product_name = ?";

    dbCart.query(sql, [quantity, username, product_name], (err, result) => {
        if (err) return res.status(500).json({ message: "Error updating cart!" });
        res.json({ message: "Cart updated successfully!" });
    });
});

app.delete("/cart/remove", (req, res) => {
    const { username, product_name } = req.body;

    // ✅ Step 1: Delete the selected item
    const deleteSQL = "DELETE FROM cart WHERE username = ? AND product_name = ?";
    dbCart.query(deleteSQL, [username, product_name], (err, result) => {
        if (err) return res.status(500).json({ message: "Error removing item!" });

        // ✅ Step 2: Check if the table is empty
        const checkSQL = "SELECT COUNT(*) AS count FROM cart";
        dbCart.query(checkSQL, (err, countResult) => {
            if (err) return res.status(500).json({ message: "Error checking cart!" });

            if (countResult[0].count === 0) {
                // ✅ Reset auto-increment when table is empty
                const resetSQL = "ALTER TABLE cart AUTO_INCREMENT = 1";
                dbCart.query(resetSQL, (err) => {
                    if (err) return res.status(500).json({ message: "Error resetting ID!" });
                    return res.json({ message: "Item removed and ID reset!" });
                });
            } else {
                // ✅ Step 3: Renumber items to maintain sequential order
                const fetchSQL = "SELECT id FROM cart ORDER BY id ASC";
                dbCart.query(fetchSQL, (err, items) => {
                    if (err) return res.status(500).json({ message: "Error fetching updated cart!" });

                    let renumberQueries = [];
                    items.forEach((item, index) => {
                        const newId = index + 1;
                        renumberQueries.push(new Promise((resolve, reject) => {
                            const updateSQL = "UPDATE cart SET id = ? WHERE id = ?";
                            dbCart.query(updateSQL, [newId, item.id], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }));
                    });

                    // ✅ Execute renumbering queries
                    Promise.all(renumberQueries)
                        .then(() => {
                            // ✅ Step 4: Reset auto-increment to the latest ID
                            const updateAutoIncrementSQL = "ALTER TABLE cart AUTO_INCREMENT = ?";
                            dbCart.query(updateAutoIncrementSQL, [items.length + 1], (err) => {
                                if (err) return res.status(500).json({ message: "Error updating AUTO_INCREMENT!" });
                                return res.json({ message: "Item removed and cart renumbered!" });
                            });
                        })
                        .catch((err) => res.status(500).json({ message: "Error renumbering cart!" }));
                });
            }
        });
    });
});

// Remove all cart items for a specific user on checkout
app.delete("/cart/clear", (req, res) => {
    console.log("Received DELETE request to /cart/clear");

    const { username } = req.body;
    console.log("Username:", username);

    if (!username) {
        console.log("Missing username in request");
        return res.status(400).json({ message: "Username is required!" });
    }

    const deleteSQL = "DELETE FROM cart WHERE username = ?";
    dbCart.query(deleteSQL, [username], (err, result) => {
        if (err) {
            console.error("Error clearing cart:", err);
            return res.status(500).json({ message: "Error clearing cart!" });
        }

        console.log("Cart cleared successfully for user:", username);
        return res.json({ message: "Cart cleared successfully!" });
    });
});

app.post("/orders/add", (req, res) => {
    console.log("Received POST request to /orders/add");

    const { username, orders } = req.body;

    if (!username || !orders || !Array.isArray(orders)) {
        return res.status(400).json({ message: "Invalid order data!" });
    }

    const values = orders.map(order => [username, order.product_name, order.price, order.quantity, order.image]);

    const insertSQL = "INSERT INTO orders (username, product_name, price, quantity, image) VALUES ?";
    dbCart.query(insertSQL, [values], (err, result) => {
        if (err) {
            console.error("Error inserting orders:", err);
            return res.status(500).json({ message: "Error saving orders!" });
        }
        console.log("Orders saved successfully for user:", username);
        res.json({ message: "Orders saved successfully!" });
    });
});

// TESTING
app.get("/orders/:username", (req, res) => {
    const { username } = req.params;
    const query = "SELECT * FROM orders WHERE username = ?";

    dbCart.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error fetching orders:", err);
            return res.status(500).json({ message: "Error retrieving orders" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.json(results);
    });
});

app.delete("/orders/delete/:id", (req, res) => {
    const { id } = req.params;

    // ✅ Step 1: Delete the selected order
    const deleteSQL = "DELETE FROM orders WHERE id = ?";
    dbCart.query(deleteSQL, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting order!" });

        // ✅ Step 2: Check if the table is empty after deletion
        const checkSQL = "SELECT COUNT(*) AS count FROM orders";
        dbCart.query(checkSQL, (err, countResult) => {
            if (err) return res.status(500).json({ message: "Error checking orders!" });

            if (countResult[0].count === 0) {
                // ✅ If table is empty, reset AUTO_INCREMENT
                const resetSQL = "TRUNCATE TABLE orders"; // This ensures all data is removed and auto-increment is reset
                dbCart.query(resetSQL, (err) => {
                    if (err) return res.status(500).json({ message: "Error resetting orders table!" });
                    return res.json({ message: "All orders removed and table reset!" });
                });
            } else {
                // ✅ Step 3: Renumber remaining orders
                const fetchSQL = "SELECT id FROM orders ORDER BY id ASC";
                dbCart.query(fetchSQL, (err, items) => {
                    if (err) return res.status(500).json({ message: "Error fetching updated orders!" });

                    let renumberQueries = [];
                    items.forEach((item, index) => {
                        const newId = index + 1;
                        renumberQueries.push(new Promise((resolve, reject) => {
                            const updateSQL = "UPDATE orders SET id = ? WHERE id = ?";
                            dbCart.query(updateSQL, [newId, item.id], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }));
                    });

                    // ✅ Execute renumbering queries
                    Promise.all(renumberQueries)
                        .then(() => {
                            // ✅ Step 4: Reset auto-increment to the latest ID
                            const updateAutoIncrementSQL = "ALTER TABLE orders AUTO_INCREMENT = ?";
                            dbCart.query(updateAutoIncrementSQL, [items.length + 1], (err) => {
                                if (err) return res.status(500).json({ message: "Error updating AUTO_INCREMENT!" });
                                return res.json({ message: "Order removed and orders renumbered!" });
                            });
                        })
                        .catch((err) => res.status(500).json({ message: "Error renumbering orders!" }));
                });
            }
        });
    });
});


// **Start Server**
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
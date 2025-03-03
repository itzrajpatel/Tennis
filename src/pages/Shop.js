import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "../App.css";
import "../styles/Button.css";
import "../styles/shop.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Importing the logo
import avatar from "../assets/avatar.png"; // Importing the avatar
import pic8 from "../assets/pic-8.png";
import pic9 from "../assets/pic-9.png";
import pic10 from "../assets/pic-10.png";
import pic11 from "../assets/pic-11.png";
import pic12 from "../assets/pic-12.png";
import pic13 from "../assets/pic-13.png";
import pic14 from "../assets/pic-14.png";
import pic15 from "../assets/pic-15.png";
import pic16 from "../assets/pic-16.png";
import pic17 from "../assets/pic-17.png";
import pic18 from "../assets/pic-18.png";
import pic19 from "../assets/pic-19.png";

const products = [
    { id: 1, name: "BLACK RACKET", price: 129, image: pic8 },
    { id: 2, name: "PROFESSIONAL WHITE TENNIS RACKET", price: 100, image: pic10 },
    { id: 3, name: "TENNIS BALL (Beginners)", price: 14, image: pic12 },
    { id: 4, name: "BLUE JACKET", price: 59, image: pic9 },
    { id: 5, name: "WHITE TENNIS HEADBAND (Nike)", price: 10, image: pic11 },
    { id: 6, name: "WHITE TENNIS SOCKS", price: 20, image: pic13 },

    // Testing
    { id: 7, name: "GREY SPORTS TENNIS BACKPACK", price: 80, image: pic14 },
    { id: 8, name: "WHITE TENNIS RACKET", price: 12, image: pic15 },
    { id: 9, name: "BLACK TENNIS RACKET CASE", price: 25, image: pic16 },
    { id: 10, name: "YELLOW TENNIS RACKET", price: 80, image: pic17 },
    { id: 11, name: "SPECIAL GREEN TENNIS RACKET", price: 12, image: pic18 },
    { id: 12, name: "BLACK BACKPACK", price: 25, image: pic19 },
];

// Testing
const ITEMS_PER_PAGE = 4;

const Shop = () => {
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [maxPrice, setMaxPrice] = useState(170);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const navigate = useNavigate(); // Hook for navigation
    const [currentPage, setCurrentPage] = useState(1); // Pagination state

    // const addToCart = (product) => {
    //     if (!loggedInUser) {
    //         alert("Please log in to add items to your cart.");
    //         return;
    //     }
    
    //     // Retrieve the existing cart from localStorage
    //     let cartItems = JSON.parse(localStorage.getItem(`cart_${loggedInUser}`)) || [];
    
    //     // Check if the product already exists in the cart
    //     const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    //     if (existingItemIndex !== -1) {
    //         cartItems[existingItemIndex].quantity += 1;
    //     } else {
    //         cartItems.push({ ...product, quantity: 1 });
    //     }
    
    //     // Update the state and localStorage
    //     setCart(cartItems);
    //     localStorage.setItem(`cart_${loggedInUser}`, JSON.stringify(cartItems));       
    // };
    
    // TESTING
    const addToCart = async (product) => {
      if (!loggedInUser) {
          alert("Please log in to add items to your cart.");
          return;
      }
  
      // ✅ Check if the item already exists in the cart
      const isItemInCart = cart.some((item) => item.product_name === product.name);
      if (isItemInCart) {
          alert("Item already present in cart...");
          return;
      }
  
      const cartItem = {
          username: loggedInUser,
          product_name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,  // Default quantity
      };
  
      try {
          const response = await fetch("http://localhost:5000/cart/add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(cartItem),
          });
  
          const data = await response.json(); // Parse response
  
          if (response.ok) {
              const updatedCart = [...cart, cartItem]; // ✅ Instantly update UI
              setCart(updatedCart);
              localStorage.setItem(`cart_${loggedInUser}`, JSON.stringify(updatedCart)); // ✅ Sync with localStorage
              alert(data.message);
          } else {
              alert(data.message); // Show error message from backend
          }
      } catch (error) {
          console.error("Error adding item:", error);
      }
  };  

    // const handleCheckout = () => {
    //   if (!loggedInUser) {
    //       alert("Please log in to continue!");
    //       return;
    //   }

    //   if (cart.length === 0) {
    //       alert("Please add items to cart...");
    //       return;
    //   }

    //   // ✅ Fetch existing orders
    //   const existingOrders = JSON.parse(localStorage.getItem(`orders_${loggedInUser}`)) || [];

    //   // ✅ Check for duplicate items
    //   const duplicateItems = cart.filter(cartItem =>
    //       existingOrders.some(orderItem => orderItem.name === cartItem.name)
    //   );

    //   if (duplicateItems.length > 0) {
    //       alert(`${duplicateItems.map(item => item.name).join(", ")} already added...`);
    //       return;
    //   }

    //   // ✅ Add new items to orders
    //   const updatedOrders = [...existingOrders, ...cart];
    //   localStorage.setItem(`orders_${loggedInUser}`, JSON.stringify(updatedOrders));

    //   // ✅ Empty the cart after checkout
    //   setCart([]);
    //   localStorage.removeItem(`cart_${loggedInUser}`);

    //   navigate("/orders");
    // };
    const handleCheckout = async () => {
      if (!loggedInUser) {
          alert("Please log in to continue!");
          return;
      }
  
      if (cart.length === 0) {
          alert("Please add items to the cart...");
          return;
      }
  
      // ✅ Fetch existing orders
      let existingOrders = JSON.parse(localStorage.getItem(`orders_${loggedInUser}`)) || [];
  
      // ✅ Prevent duplicate items in orders
      const duplicateItems = cart.filter(cartItem =>
          existingOrders.some(orderItem => orderItem.product_name === cartItem.product_name)
      );
  
      if (duplicateItems.length > 0) {
          alert(`${duplicateItems.map(item => item.product_name).join(", ")} already added...`);
          return;
      }
  
      // ✅ Add new cart items to orders
      existingOrders = [...existingOrders, ...cart];
      localStorage.setItem(`orders_${loggedInUser}`, JSON.stringify(existingOrders));
  
      try {
          console.log("Sending DELETE request to /cart/clear for user:", loggedInUser);
  
          // ✅ Remove items from MySQL cart table
          const response = await fetch("http://localhost:5000/cart/clear", {
              method: "DELETE",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ username: loggedInUser }), // ✅ Ensure request body is correctly formatted
          });
  
          const data = await response.json();
          console.log("Response from backend:", data);
  
          if (!response.ok) {
              throw new Error(data.message || "Error clearing cart from database");
          }
  
          // ✅ Clear the cart in state & localStorage
          setCart([]);
          localStorage.removeItem(`cart_${loggedInUser}`);
  
          // ✅ Redirect to orders page
          navigate("/orders");
  
      } catch (error) {
          console.error("Checkout Error:", error);
          alert("Error processing checkout!");
      }
  };      

    const filteredProducts = products.filter(
        (p) => p.price <= maxPrice && p.name.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    // useEffect(() => {
    //   const user = localStorage.getItem("loggedInUser");
    //   setLoggedInUser(user); // Set logged-in user state
    
    //   if (user) {
    //     const savedCart = localStorage.getItem(`cart_${user}`);
    //     if (savedCart) {
    //       setCart(JSON.parse(savedCart)); // Load saved cart for the logged-in user
    //     }
    //   } else {
    //     setCart([]); // Hide cart but keep it saved in localStorage
    //   }
    // }, []);

    // TESTING
    const fetchCartItems = async (user) => {
      if (!user) return;  // Ensure user is logged in
  
      try {
          const response = await fetch(`http://localhost:5000/cart/${user}`);
          if (response.ok) {
              const data = await response.json();
              setCart(data); // ✅ Update the state
              localStorage.setItem(`cart_${user}`, JSON.stringify(data)); // ✅ Sync with localStorage
          }
      } catch (error) {
          console.error("Error fetching cart:", error);
      }
  };
  
  // ✅ Load cart from localStorage & API on page refresh
  useEffect(() => {
      const user = localStorage.getItem("loggedInUser");
      if (user) {
          setLoggedInUser(user);
  
          // ✅ First, check if cart is in localStorage
          const storedCart = localStorage.getItem(`cart_${user}`);
          if (storedCart) {
              setCart(JSON.parse(storedCart));
          }
  
          // ✅ Fetch latest cart data from backend
          fetchCartItems(user);
      }
  }, []);  

    const handleLogout = () => {
      localStorage.removeItem("loggedInUser"); // Remove session
      localStorage.removeItem("token"); // Remove token
      setLoggedInUser(null);
      setCart([]); // Hide cart items, but keep them stored in MySQL
      navigate("/");
    };
    return (
        <div style={{ backgroundColor: "#f3f8f9"}}>
            {/* <--- NAVBAR --->*/}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
              <div className="container-fluid" style={{ gap: "15px" }}>
                <img alt="Logo" src={logo} height="50px" width="50px" style={{ margin: "0 20px" }} />
                <a className="navbar-brand" href="/" style={{ fontFamily: "Ovo, serif", fontSize: "19px", fontWeight: "bold" }}>
                  Indian Tennis Academy
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ms-auto" style={{ gap: "12px" }}>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#events">Events</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#blogs">Blogs</a>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/shop">Shop</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/orders">Orders</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/contact">Contact</Link>
                    </li>

                    {/* Conditionally render Login or Profile Image */}
                    {!loggedInUser ? (
                      <li className="nav-item">
                        <Link className="nav-link" to="/login">Login</Link>
                      </li>
                    ) : (
                      <li className="nav-item dropdown">
                        <img src={avatar} className="rounded-circle mt-2" alt="Profile" width="30" height="30" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: "pointer" }} />
                        <ul className="dropdown-menu dropdown-menu-end mt-3 bg-dark">
                          <li>
                            <button id="logoutbtn" className="dropdown-item text-light" onClick={handleLogout}>
                              Logout
                            </button>
                          </li>
                        </ul>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </nav>

            <div className="container-fluid my-5">
                <h1 className="text-center my-5" style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: "bold", fontSize: "60px" }}>SHOP</h1>
                <h1 className="text-center mt-5"> <i style={{ fontSize: "35px" }} className='fas'>&#xf107;</i> </h1>
                <div className="row text-center p-5 g-5 my-5">
                    <div className="col-md-8 mx-auto">
                    <div className="row">
  {currentItems.map((product) => (
    <div className="col-md-5 col-sm-6 col-12 mb-5 mx-auto">
      <div
        className="p-4 shop-item"
        style={{
          height: "550px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "12px",
          boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
          padding: "20px",
          background: "linear-gradient(135deg, #4b79a1, #283e51)",
        }}
      >
        {/* Enlarged Image Container */}
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            width: "100%",
            height: "auto",
            minHeight: "180px",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{
              maxWidth: "100%",
              maxHeight: "250px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Product Name */}
        <h4
          className="fw-bold text-white text-center"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "26px", // Default size for larger screens
          }}
        >
          {product.name}
        </h4>

        {/* Price Display */}
        <p
          className="fw-bold text-white text-center"
          style={{
            fontSize: "30px", // Default size for larger screens
          }}
        >
          ${product.price}.00
        </p>

        {/* Add to Cart Button */}
        <button
          className="btn bg-dark text-light w-100 d-md-inline-block"
          style={{
            maxWidth: "200px",
            fontSize: "15px",
            padding: "12px 0",
            borderRadius: "10px",
          }}
          key={product.id}
          onClick={() => addToCart(product)}
        >
          ADD TO CART <i className="fa fa-shopping-cart mx-1" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  ))}
</div>

                        {/* Testing */}
                        <nav>
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                                    <button className="page-link custom-btn p-1 mx-auto" onClick={() => setCurrentPage(currentPage - 1)}disabled={currentPage === 1}>
                                        <i style={{ fontSize: "24px" }} className='fas'>&#xf104;</i>
                                    </button>
                                </li>

                                {[...Array(totalPages)].map((_, index) => (
                                    <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                                        <button className="page-link custom-btn" onClick={() => setCurrentPage(index + 1)}>
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link custom-btn" onClick={() => setCurrentPage(currentPage + 1)}disabled={currentPage === totalPages}>
                                        <i style={{ fontSize: "24px" }} className='fas'>&#xf105;</i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 bg-light">
                        <h4 className="mx-4 my-3" style={{ textAlign: "start", fontFamily: "Oswald, serif" }}>Cart</h4>
                        {cart.length === 0 ? (
                            <p className="text-center text-danger mb-5">No item added to cart...</p>
                        ) : (
                            <>
                                <ul className="mb-3">
                                    {/* {cart.map((item, index) => (
                                        <li style={{ textAlign: "start" }} key={index}>
                                            {item.name} - ${item.price} 
                                            <i style={{ fontSize: "15px", color: "red", cursor: "pointer" }} className="fa fa-trash mx-2" onClick={() => { const updatedCart = cart.filter((_, i) => i !== index); setCart(updatedCart); localStorage.setItem(`cart_${loggedInUser}`, JSON.stringify(updatedCart)); }}> </i>
                                        </li>
                                    ))} */}
                                    {cart.map((item, index) => (
                                      <li style={{ textAlign: "start" }} key={index}>
                                          {item.product_name} - ${item.price} 
                                          <i 
                                              style={{ fontSize: "15px", color: "red", cursor: "pointer" }} 
                                              className="fa fa-trash mx-2" 
                                              onClick={async () => {
                                                  try {
                                                      const response = await fetch("http://localhost:5000/cart/remove", {
                                                          method: "DELETE",
                                                          headers: {
                                                              "Content-Type": "application/json",
                                                          },
                                                          body: JSON.stringify({
                                                              username: loggedInUser,
                                                              product_name: item.product_name, // Make sure this matches your backend field
                                                          }),
                                                      });

                                                      if (response.ok) {
                                                          const updatedCart = cart.filter((_, i) => i !== index);
                                                          setCart(updatedCart);
                                                          localStorage.setItem(`cart_${loggedInUser}`, JSON.stringify(updatedCart));
                                                      } else {
                                                          alert("Error removing item!");
                                                      }
                                                  } catch (error) {
                                                      console.error("Error:", error);
                                                  }
                                              }}
                                          ></i>
                                      </li>
                                    ))}
                                </ul>
                                <hr className="mx-auto"/>
                                <h5 className="text-dark mx-4 mb-5" style={{ textAlign: "start" }}>
                                    Total: ${cart.reduce((total, item) => total + Number(item.price), 0)}
                                </h5>
                            </>
                        )}
                        <h4 className="mx-4 my-3" style={{ textAlign: "start", fontFamily: "Oswald, serif"}}>Search</h4>
                        <form className="form-inline mx-4 mb-5" style={{ textAlign: "start"}}>
                            <input type="text" className="form-control mx-auto" placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
                        </form>
                        <h1 className="mx-4 my-3" style={{ textAlign: "start", fontSize: "20px", fontFamily: "Oswald, serif" }}> CATEGORIES </h1>
                        <p className="mx-4 text-dark" style={{ textAlign: "start" }}> • Tennis rackets </p>
                        <p className="mx-4 text-dark" style={{ textAlign: "start" }}> • Tennis balls </p>
                        <p className="mx-4 text-dark" style={{ textAlign: "start" }}> • Tennis clothing </p>
                        <p className="mx-4 text-dark" style={{ textAlign: "start" }}> • Tennis shoes </p>
                        <p className="mx-4 mb-5 text-dark" style={{ textAlign: "start" }}> • Tennis suits </p>
                        <h4 className="mx-4" style={{ textAlign: "start"}}>Filter</h4>
                        <form className="form-inline mx-4 mb-5" style={{ textAlign: "start"}}>
                            <input type="range" className="form-range mx-auto" data-bs-theme="dark" min="10" max="170" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                            <p className="text-dark" style={{ textAlign: "center"}}>Price: ${maxPrice}</p>
                        </form>
                        <button
  className="btn text-light w-100"
  style={{
    backgroundColor: "#2eac6d",
    maxWidth: "200px", // Ensures it doesn't stretch too much
    borderRadius: "30px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    fontSize: "16px", // Default for larger screens
    padding: "12px 0",
  }}
  onClick={handleCheckout}
>
  CHECK OUT
  <i className="fas mx-2" style={{ fontSize: "15px" }}>&#xf291;</i>
</button>
                    </div>
                </div>
            </div>
        </div>

        {/* <--- FOOTER ---> */}
        <footer className="bg-dark text-light text-center py-3">
            <div>© Raj Patel · <a href="#" className="text-decoration-none text-light">Privacy</a> · <a href="#" className="text-decoration-none text-light">Terms</a></div>
            <a href="#" className="text-decoration-none text-light">Back to top</a>
        </footer>
    </div>
  )
}

export default Shop;
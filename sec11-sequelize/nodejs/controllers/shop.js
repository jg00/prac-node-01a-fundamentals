const Product = require("../models/product");
const Cart = require("../models/cart");

// Navigation link "Products"
exports.getProducts = (req, res, next) => {
  // Sequelize model
  Product.findAll()
    .then(products => {
      // console.log(products); // [{},{}..]

      res.render("shop/product-list", {
        prods: products, // Inject as an object with a key name that we can refer to in the template.
        pageTitle: "All Products",
        path: "/products"
      });
    })
    .catch(err => console.log(err));

  /* 'mysql2' package
    Product.fetchAll()
      .then(([rows, fieldData]) => {
        res.render("shop/product-list", {
          prods: rows, // Inject as an object with a key name that we can refer to in the template.
          pageTitle: "All Products",
          path: "/products"
        });
      })
      .catch(err => {
        console.log(err);
      });
  */

  /* File data source
    Product.fetchAll(products => {
      res.render("shop/product-list", {
        prods: products, // Inject as an object with a key name that we can refer to in the template.
        pageTitle: "All Products",
        path: "/products"
      });
    });
  */
};

// "Details" button in "Products" page
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // Sequelize model
  Product.findAll({
    where: { id: prodId }
  })
    .then(products => {
      // console.log(products); // .findAll() returns us an array

      res.render("shop/product-detail", {
        product: products[0],
        pageTitle: products[0].title,
        path: "/products"
      });
    })
    .catch(err => console.log(err));

  /*   
    // Sequelize model - another approach
    Product.findByPk(prodId)
      .then(product => {
        console.log(product); // .findByPk() returns an object {dataValues: {id:1, title:'A Book', ..}}

        res.render("shop/product-detail", {
          product: product,
          pageTitle: product.title,
          path: "/products"
        });
      })
      .catch(err => console.log(err));
  */

  /* 'mysql2' package
    Product.findById(prodId)
      .then(([product]) => {
        // console.log(product[0]); // {id:2, title:'', price:9.99, description:'', imageUrl:''}
        res.render("shop/product-detail", {
          product: product[0],
          pageTitle: product.title,
          path: "/products"
        });
      })
      .catch(err => console.log(err));
  */

  /* File data source
    Product.findById(prodId, product => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    });
  */
};

// Navigation link "Shop"
exports.getIndex = (req, res, next) => {
  // Sequelize model
  Product.findAll()
    .then(products => {
      // console.log(products); // [{},{}..]

      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));

  /* 'mysql2' package
    Product.fetchAll()
      .then(([rows, fieldData]) => {
        // console.log(rows, fieldData);  // [[of rows], [of field attributes]]

        res.render("shop/index", {
          prods: rows,
          pageTitle: "Shop",
          path: "/"
        });
      })
      .catch(err => {
        console.log(err);
      });
  */

  /* File data source
    Product.fetchAll(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    });
  */
};

// After User/Cart associated via Sequelize - Now we want to get the cart assoiated to our existing user and get all products in the cart
// Navigation link "Cart"
exports.getCart = (req, res, next) => {
  // console.log("HERE", req.user.cart); // 'undefined' because we never added cart property to our req object.  We can still get cart through our req.user.getCart() Sequelize instance method below.
  // -> Key here with req.user.getCart() is "we are loading the cart associated to a user from the database"
  req.user
    .getCart() // Sequelize instance method
    .then(cart => {
      // console.log("HERE", cart); // null - originally because we did not have a cart associated to the demo user

      // Now with the cart available, we can fetch the products available inside of it.
      return cart
        .getProducts()
        .then(products => {
          // console.log("HERE", products);
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products // This was previously productData:product.  This means we have to change how it is referenced in the cart.ejs view.
            // Also note we can now access products.cartItem.quantity in our view. (cartItem is the 'joining table' we defined to join n:m - cart:product)
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log);

  // Cart.getCart(cart => {
  //   // Remeber the cart only has the product id's, qty, and cart total.  However we also need produduct detail info.
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     // Now that we have all the products we need to filter for products that are actually in the cart
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty }); // cartProducts.push(product) - You need the other info as well
  //       }
  //     }

  //     res.render("shop/cart", {
  //       pageTitle: "Your Cart",
  //       path: "/cart",
  //       products: cartProducts
  //     });
  //   });
  // });
};

/*
  // Before User/Cart associated via Sequelize
  // Navigation link "Cart"
  exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
      // Remeber the cart only has the product id's, qty, and cart total.  However we also need produduct detail info.
      Product.fetchAll(products => {
        const cartProducts = [];
        // Now that we have all the products we need to filter for products that are actually in the cart
        for (product of products) {
          const cartProductData = cart.products.find(
            prod => prod.id === product.id
          );
          if (cartProductData) {
            cartProducts.push({ productData: product, qty: cartProductData.qty }); // cartProducts.push(product) - You need the other info as well
          }
        }

        res.render("shop/cart", {
          pageTitle: "Your Cart",
          path: "/cart",
          products: cartProducts
        });
      });
    });
  };
*/

/*
  // After - Cart/Product association using Sequelize
  // "Add to Cart" button in "Product Detail" page

  1 Get user's cart (placed in fetchedCart variable to make available in the overall function)
  2 Find if product already exists in the cart
      a if it does then just update the quantity
      b if it does not then add the product
 
*/
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1; // initialized for products that do not exists yet

  req.user
    .getCart()
    .then(cart => {
      // Remember cart is only available in this anonymous function so that is why we create a fetchedCart variable outside to make cart available below.
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } }); // still returns an [] of products eventhough we only ask for a specfic product
    })
    .then(products => {
      let product; // undefined if specific product was not found in the cart

      // (1) If product already in cart, we need are only using it to get the product quantity in this .then() block
      if (products.length > 0) {
        product = products[0];

        /* Side test only to see product instance methods and utilize them
          console.log("PRODUCT", Object.keys(Product.prototype));
          product.getCarts().then(carts => console.log(carts));
          product.getUser().then(user => console.log(user));
        */
      }

      // If there product exists (ie product is not undefined)
      // -> Here we are only using the existing product to get the old quantity to set the new quantity.  We still return the existing product.
      if (product) {
        // At this point this is the product we found in our cart (ie exists in the cart)
        // console.log("PROD EXISTS IN CART", product.cartItem); // Because of our n:m relation between Cart/Product we can access the 'joining table' we called cartItem
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        // return product; // Return existing product but at this point the newQuantity has been set accordinly
        return Promise.resolve(product); // Same as return product
      }

      // (2) If we don't have a product yet, we know this product is not part of the cart yet.
      // To add a product, we get the product object first and add that product to the cart.
      // In addition we set some other fields in the 'join table'.
      return Product.findByPk(prodId);
    })

    // We either get a new product to add or existing product to add.
    // .addProduct() is how we would both 'add' (if does not exists) and 'edit' (if exists) a product and change the quantity accordingly.
    // This is how you would also 'edit' quantity in the 'joining table'
    // -> If it is a new product it INSERTS, if product exists, it updates
    // INSERT INTO `cartItems` (`id`,`quantity`,`createdAt`,`updatedAt`,`cartId`,`productId`) VALUES (NULL,1,'2019-11-14 21:44:10','2019-11-14 21:44:10',1,4);
    // UPDATE `cartItems` SET `quantity`=?,`updatedAt`=? WHERE `cartId` = ? AND `productId` = ?
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })

    .then(() => {
      res.redirect("/cart");
    })

    .catch(err => {
      console.log(err);
    });
};

/* Before - Cart/Product association using Sequelize
  // "Add to Cart" button in "Product Detail" page
  exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId, product => {
      Cart.addProduct(prodId, product.price);
    });

    res.redirect("/cart");
  };
*/

/*
      1 get user cart
      2 get products in the cart
      3 destroy the product in the cart
  */
// After User/Cart associated via Sequelize
// "Delete" button from "Cart" page
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // let fetchedCart; // Use if using .removeProduct approach below

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();

      // Another approach works as well
      // return fetchedCart.removeProduct(product);

      // console.log("HERE", product);
      // console.log("PRODUCT QUANTITY", product.cartItem.quantity);
    })
    .then(result => {
      // console.log("Item removed from the cart!");
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

/* 
  // Before User/Cart associated via Sequelize
  // "Delete" button from "Cart" page
  exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
      Cart.deleteProduct(prodId, product.price);
      res.redirect("/cart");
    });
  };
 */

/*
  Post orders:
  1 get user cart
  2 get user cart items
  3 create an order for the user
  4 -> Add products to the order (for each product we need to 'correctly' add to the orderItem 'joining' table the quantity value)
*/
exports.postOrders = (req, res, next) => {
  let fetchedCart;

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      // console.log(products); // Product and the cartItem returned

      // Create a user order an copy cart items to the order
      req.user
        .createOrder() // note creates an instance every time
        .then(order => {
          // console.log("ORDER STARTED", order);
          // console.log("ORDER ITEMS", order.orderItem); // At this point we order.orderItem is "undefined" be we want to add rows to it with quantity values for each product.
          /*
            -> Here we are not adding a single product.  We are adding multiple products. So we have to set the 'quantity' correctly.
            order.addProducts(products, {through: {quantity: {'set correctly for each product'}})
            order.addProducts(products); // Side note, this will add entries into orderItems table but orderItems.quantity will be 'null'.
          */

          /* Check only - For each product we will set a property 'orderItem' that corresponds to our 'joining table' model
            products.forEach(product => {
              product.orderItem = { quantity: product.cartItem.quantity };
              console.log(product);
            });
          */

          /*
            -> Each product needs to have a special field which is then understood
            by Sequelize. To assign that special field we add product.orderItem
            which Sequelize will look for due to our order/product Sequelize association we
            created.
            -> Set product.orderItem "stores JavaScript object" where you configure
            the value for this 'joining table'.  
          */
          const updatedProducts = products.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity }; // Configure the value for the 'joining table' that Sequelize will look for.
            return product;
          });

          return order.addProducts(updatedProducts);
        })
        .then(result => {
          // After adding products to the order is successful we want to clear the cart
          return fetchedCart.setProducts(null); // Removes all products related to the cart in the cartItems table.
        })
        .then(result => {
          res.redirect("/orders");
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => console.log(err));
};

/*

product {
    dataValues:
     { id: 1,
       title: 'Test Product 1',
       price: 1.99,
       imageUrl:
        'https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png',
       description: 'prod desc 1',
       createdAt: 2019-11-16T02:25:22.000Z,
       updatedAt: 2019-11-16T02:25:22.000Z,
       userId: 1,
       cartItem: [cartItem] }  <- cartItem 
*/

// Navigation link "Orders"
// -> LEFT OUTER JOIN. 'Eager loading' example.
exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] }) // -> With Order.belongsToMany(Product, {though: OrderItem}) we also 'include all' products [] array for each order.
    .then(orders => {
      /* Note this is returning [] of orders associated to user.  
         In the view, orders.ejs, we loop though the orders array and for each order we 
         have access to the 'joining table' using order.orderItem.
      */
      // console.log(orders); // products: [ [product], [product] ] } ] now added to each order with .getOrders({include: ["products"]})

      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
      });
    })

    .catch(err => console.log(err));
};

// "Checkout" button within "Cart" page
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
  });
};

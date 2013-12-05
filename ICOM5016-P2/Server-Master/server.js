// Express is the web framework 
var express = require('express');
var pg = require('pg');
var nodemailer = require('nodemailer');

var app = express();
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function () {
  app.use(allowCrossDomain);
});

app.use(express.bodyParser());

// Database connection string: pg://<username>:<password>@host:port/dbname 
var dbConnInfo = "pg://rjnadmin:database@localhost:5432/rjnbaydb";

var modules = require("./modules.js");

/*==================================================================*/
/*								Categories							*/
/* This array emulates the category entity in the database.
/*==================================================================*/
var Category = modules.Category;
//var categoryList = modules.categoryList;

var categoryList = new Array(
	//Category: function (id, name, parent)
	new Category(1, "Books", null),
	new Category(2, "Electronics", null),
	new Category(3, "Computers", null),
	new Category(4, "Clothing", null),
	new Category(5, "Shoes", null),
	new Category(6, "Sports", null),
	new Category(41, "Other", null),

	new Category(7, "Children", 1),
	new Category(8, "Fiction", 1),
	new Category(9, "Technology", 1),
	new Category(10, "Business", 1),

	new Category(11, "TV", 2),
	new Category(12, "Audio", 2),
	new Category(13, "Phones", 2),
	new Category(14, "Cameras", 2),
	new Category(15, "Video", 2),

	new Category(16, "Laptops", 3),
	new Category(17, "Desktops", 3),
	new Category(18, "Tablets", 3),
	new Category(19, "Printers", 3),
	
	new Category(20, "Children",4),
	new Category(21, "Men", 4),
	new Category(22, "Women", 4),

	new Category(23, "Children", 5),
	new Category(24, "Men", 5),
	new Category(25, "Women", 5),

	new Category(26, "Bicycles", 6),
	new Category(27, "Fishing", 6),
	new Category(28, "Baseball", 6),
	new Category(29, "Gulf", 6),
	new Category(30, "Basketball", 6),

	new Category(31, "Shirts", 21),
	new Category(32, "Pants", 21),
	new Category(33, "Socks", 21),

	new Category(34, "Shirts", 22),
	new Category(35, "Pants", 22),
	new Category(36, "Dresses", 22),

	new Category(37, "Frames", 26),
	new Category(38, "Wheels", 26),
	new Category(39, "Helmet", 26),
	new Category(40, "Parts", 26)
	);

var categoryNextId = 42; 

/*for (var i=0; i < categoryList.length;++i){
	categoryList[i].id = categoryNextId++;
}*/

// REST Operations
// Idea: Data is created, read, updated, or deleted through a URL that 
// identifies the resource to be created, read, updated, or deleted.
// The URL and any other input data is sent over standard HTTP requests.
// Mapping of HTTP with REST 
// a) POST - Created a new object. (Database create operation)
// b) GET - Read an individual object, collection of object, or simple values (Database read Operation)
// c) PUT - Update an individual object, or collection  (Database update operation)
// d) DELETE - Remove an individual object, or collection (Database delete operation)

// REST Operation - HTTP GET to read all categories
// NOTE: For Phase 2-3, this get will be used for the actual home page that displays deals. 
// For now, it gets the main categories whose parent == NULL and returns them on the #home page
app.get('/Server-Master/home', function(req, res) {
	console.log("GET categories");

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT cid as id, cname as name from categories where cparent IS NULL");
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		// Do we want this msg? 
		if(result.rowCount == 0){
			client.end();
			res.statusCode = 404;
    		res.send("No categories not found.");
		}
		else{
			var response = {"categories" : result.rows};
  			client.end();
	  		res.json(response);
	  	}
 	});
});


// REST Operation - HTTP GET to read a category based on its id to load edit category page info
app.get('/Server-Master/home/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET category (for edit): " + id);

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT cid as id, cname as name from categories where cid = $1", [id]);
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
    	if(result.rowCount == 0){
  			client.end();
    		res.statusCode = 404;
    		res.send("Category not found.");
    	}
    	else {
			var response = {"category" : result.rows};
			client.end();
    		res.json(response);
    	}
 	});
});

// REST Operation - HTTP PUT to updated a category based on its id
app.put('/Server-Master/home/:id', function(req, res) {
	var id = req.params.id;
		console.log("PUT category: " + id);

	if ((id < 0) || (id >= categoryNextId)){
		// not found
		res.statusCode = 404;
		res.send("Category not found.");
	}
	else if(!req.body.hasOwnProperty('name')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for category.');
  	}
	else {
		var target = -1;
		for (var i=0; i < categoryList.length; ++i){
			if (categoryList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Category not found.");			
		}	
		else {
			var theCategory= categoryList[target];
			theCategory.name = req.body.name;
			var response = {"category" : theCategory};
  			res.json(response);		
  		}
	}
});

// REST Operation - HTTP DELETE to delete a category based on its id
app.del('/Server-Master/home/:id', function(req, res) {
	var id = req.params.id;
		console.log("DELETE category: " + id);

	if ((id < 0) || (id >= categoryNextId)){
		// not found
		res.statusCode = 404;
		res.send("Category not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < categoryList.length; ++i){
			if (categoryList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Category not found.");			
		}	
		else {
			categoryList.splice(target, 1);
  			res.json(true);
  		}		
	}
});

// REST Operation - HTTP POST to add a new a category
app.post('/Server-Master/home', function(req, res) {
	console.log("POST");

  	if(!req.body.hasOwnProperty('name') ){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for category.');
  	}

  	var newCategory = new Category(req.body.name);
  	console.log("New Category: " + JSON.stringify(newCategory));
  	newCategory.id = categoryNextId++;
  	categoryList.push(newCategory);
  	res.json(true);
});

// REST Operation - HTTP GET to read all children (if they exist)
app.get('/Server-Master/home/categories/:id/:SortType', function(req, res) {
	var id = req.params.id;
	var SortType = req.params.SortType;
	var theAuctionProducts, theParent;
	var theType = true; // if remains true at end content of response is subcategories
	var client = new pg.Client(dbConnInfo);
	client.connect();
	
	// Query Code for getting subqueries
	var query = client.query("SELECT c1.cid as id, c1.cname as name, c1.cparent as parent, parent_name from categories as c1, (SELECT cid, cname as parent_name from categories where cid = $1) AS c2 where cparent = $2 and cparent = c2.cid", [id, id]);
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		// Responds with sub categories of id if they exist
		if(result.rowCount > 0){
			console.log("GET subcategories of " + id + " Sorted By: " + SortType);
			var response = {"categories" : result.rows, "type" : theType, "parent" : result.rows[0].parent_name};
			client.end();
			res.json(response);
		}
		// If there are no subcategories, it GETs the products of this subcategory and responds with them
		else {
			theType = false; //content of theChildren are products
			console.log("GET products of category " +id+ ", sorted by " + SortType);

		 	// returns products that are being auctioned get auction id and current bid if product is up for auction
			var query1 = client.query("SELECT product_id, name, instant_price, cid as parent, image_filename, cname as parent_name, current_bid, auction_id from auctions natural join products natural join categories where cid = $1", [id]);
			query1.on("row", function (row, result) {
		    	result.addRow(row);
			    //get number of bids for this product
/*			 	var query2 = client.query("SELECT count(*) as num_of_bids from placed_bids natural join auctions where product_id = $1", [result1.product_id]);
			 	query2.on('row', function (row2, result2){
			 		result2.addRow(row2);
			 	});
			 	query2.on('end', function (result2){
			 		if(result2.rowCount == 0){
			 			result.num_of_bids = 0;
			 		}
			 		if(result2.rowCount > 0){
			 			result.num_of_bids = result2.rows[0].num_of_bids;
					}
			 	});*/
			});
			query1.on("end", function (result) {
				if(result.rows > 0){
					theParent = result.rows[0].parent_name;
				}
				theAuctionProducts = result.rows;
			});

			// returns products being sold but not auctioned (quantity > 0)
			var query3;
			switch(SortType) {
				case "name":
			  		query3 = client.query("SELECT product_id, name, instant_price, cid as parent, image_filename, quantity, cname as parent_name from products natural join categories where cid = $1 and quantity > 0 and product_id not in (select product_id from auctions) order by name", [id]);
			  		break; 
			  	case "price":
			  		query3 = client.query("SELECT product_id, name, instant_price, cid as parent, image_filename, quantity, cname as parent_name from products natural join categories where cid = $1 and quantity > 0 and product_id not in (select product_id from auctions) order by instant_price", [id]);
			  		break;
			  	case "brand":
			  		query3 = client.query("SELECT product_id, name, instant_price, cid as parent, image_filename, quantity, cname as parent_name from products natural join categories where cid = $1 and quantity > 0 and product_id not in (select product_id from auctions) order by brand", [id]);
			  		break;
			  	default:
			  		query3 = client.query("SELECT product_id, name, instant_price, cid as parent, image_filename, quantity, cname as parent_name from products natural join categories where cid = $1 and quantity > 0 and product_id not in (select product_id from auctions)", [id]);
			};
			query3.on("row", function (row, result) {
		    	result.addRow(row);
			});
			query3.on("end", function (result) {
				if(result.rowCount == 0 && theAuctionProducts.rowCount ==0){
					client.end();
					res.statusCode = 404;
					res.send("No products found.");	
				}
				else{
					var response;
					if(result.rowCount == 0){
						response = {"sale_products" : [], "auction_products" : theAuctionProducts, "type" : theType, "parent" : theParent};
					}
					else{
						response = {"sale_products" : result.rows, "auction_products" : theAuctionProducts, "type" : theType, "parent" : result.rows[0].parent_name};
					}		
					client.end();
					res.json(response);
				}
			});
		}
	});
});

// REST Operation - HTTP GET to get category's parent id
app.get('/Server-Master/subCategory/:id', function(req, res) {
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT cid as id, cname as name from categories where cid = $1", [id]);
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		if (result.rowCount == 0){
			client.end();
			res.statusCode = 404;
			res.send("Category not found.");			
		}
		else {
			console.log("GET subCategory: " + id);
			var response = {"parent" : result.rows[0]};
			client.end();
	  		res.json(response);
  		}
 	});
});

/*==================================================================*/
/*								Products							*/
/*==================================================================*/

var Product = modules.Product;

//Product: name,parent,sellerId,instant_price,bidPrice,description,model,brand,dimensions,numOfBids
var productList = new Array(
	new Product("MyPhone", 13, 0, 500, 400, "Brand new, still in box Myphone.", "MyPhone5X", "Mapple", '10"x8"x0.5"',0),
    new Product("Viperus", 38, 0, 901, 700, "Honyota Viperus Wheels. Its so fast your skin flies off.", "Viperus XLR", "Honyota", '15" diameter with 2" thickness',0),
    new Product("Test Product 1", 41, 1, 9001, 42, "Test of product printing", "model", "brand", "dimensions",2),
	new Product("Test Product 7", 7, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 8", 8, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 9", 9, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 10", 10, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 11", 11, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 12", 12, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 13", 13, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 14", 14, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 15", 15, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 16", 16, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 17", 17, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 18", 18, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 19", 19, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 20", 20, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 31", 31, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 32", 32, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 33", 33, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 34", 34, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 35", 35, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 36", 36, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 37", 37, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 38", 38, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 39", 39, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 40", 40, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 27", 27, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 28", 28, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 29", 29, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 30", 30, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 23", 23, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 24", 24, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2),
	new Product("Test Product 25", 25, 1, 9001, 390, "product description goes here", "model goes here", "brand goes here", "dimensions go here",2)
	);

var productNextId = 0;

for (var i=0; i < productList.length;++i){
	productList[i].id = productNextId++;
}

var ProductBid = modules.ProductBid;

//ProductBid: productId, bidderId, bidPrice
var productBidsList = new Array(
	new ProductBid("2","0",42),
	new ProductBid("2","2",38)
	);
var productBidsNextId = 0;

for (var i=0; i < productBidsList.length;++i){
	productBidsList[i].id = productBidsNextId++;
}

// REST Operation - HTTP GET to read a product based on its id
app.get('/Server-Master/product/:id', function(req, res) {
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();
	
	// Query to get product information. 
	// second query checks if the product is up for auction, then adds info to the response
	// if product is up for auction, third query checks number of bids and adds info to the response
	var theProduct;

	var query = client.query("SELECT * from products natural join (select account_id as seller_id, username from accounts) as seller where product_id = $1", [id]);
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		if (result.rowCount == 0){
			client.end();
			res.statusCode = 404;
			res.send("Product not found.");
		}
		else {
			console.log("GET product: " + id);;
			theProduct = result.rows[0];
	  	}
 	});

 	//get auction id and current bid if product is up for auction
	var query2 = client.query("SELECT current_bid, auction_id from auctions where product_id = $1", [id]);
	query2.on("row", function (row, result) {
    	result.addRow(row);
	});
	query2.on("end", function (result) {
		if(result.rowCount == 0){
			theProduct.has_auction = false;
		}
		else {
			theProduct.has_auction = true;
			theProduct.current_bid = result.rows[0].current_bid;
			theProduct.auction_id = result.rows[0].auction_id;
		}
	});
	//get number of bids for this product
 	var query3 = client.query("SELECT count(*) as num_of_bids from placed_bids natural join auctions where product_id = $1", [id]);
 	query3.on('row', function (row, result){
 		result.addRow(row);
 	});
 	query3.on('end', function (result){
 		if(result.rowCount == 0){
 			theProduct.num_of_bids = 0;
 		}
 		if(result.rowCount > 0){
 			theProduct.num_of_bids = result.rows[0].num_of_bids;
		}
		var response = {"product" : theProduct};
		client.end();
		res.json(response);
 	});
});

// REST Operation - HTTP POST to add a new product
app.post('/Server-Master/product/:sellerId', function(req, res) {
	console.log("POST new product");

  	if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('description')||!req.body.hasOwnProperty('model')
			||!req.body.hasOwnProperty('brand')||!req.body.hasOwnProperty('dimensions')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for product.');
  	}

  	// need boolean for if product is for auction or regular sale
  	// need boolean for if auction product has buyout price or not
  	var sellerId = req.params.id;
  	var new_product = "'"+req.body.name+"'";

  	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("INSERT INTO products (name) VALUES ($1)", new_product);
	client.end();

  	console.log("New Product: " + JSON.stringify(new_product));
  	res.json(true);
});

//REST Operation - HTTP PUT to edit product based on its id
app.put('/Server-Master/product/:id', function(req, res) {
	var id = req.params.id;
		console.log("PUT product: " + id);

	if ((id < 0) || (id >= productNextId)){
		// not found
		res.statusCode = 404;
		res.send("Product not found.");
	}
	else if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('parent')||!req.body.hasOwnProperty('instantPrice')
			||!req.body.hasOwnProperty('bidPrice')||!req.body.hasOwnProperty('description')||!req.body.hasOwnProperty('model')
			||!req.body.hasOwnProperty('brand')||!req.body.hasOwnProperty('dimensions')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for product.');
  	}
	else {
		var target = -1;
		for (var i=0; i < productList.length; ++i){
			if (productList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Product not found.");			
		}	
		else {
			var theProduct= productList[target];
			theProduct.name = req.body.name;
			var response = {"product" : theProduct};
  			res.json(response);		
  		}
	}
});

//REST Operation - HTTP DELETE to delete product based on its id
app.del('/Server-Master/product/:id', function(req, res) {
	var id = req.params.id;
		console.log("DELETE product: " + id);

	if ((id < 0) || (id >= productNextId)){
		// not found
		res.statusCode = 404;
		res.send("Product not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < productList.length; ++i){
			if (productList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Product not found.");			
		}	
		else {
			productList.splice(target, 1);
  			res.json(true);
  		}		
	}
});

//REST Operation - HTTP PUT to update current bid on product by id
app.put('/Server-Master/home/product/:id/bid', function(req, res) {
	var id = req.params.id;
	console.log("PUT bid on product id " + id);

	var bid = req.body.bid;

	if ((id < 0) || (id >= productNextId)){
		// not found
		res.statusCode = 404;
		res.send("Product not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < productList.length; ++i){
			if (productList[i].id == id){
				target = i;
				var currentBid = productList[i].bidPrice;
				if(currentBid <= bid){
					currentBid = bid;
				}
				else{
					res.statusCode = 400;
					res.send("Placed bid is bellow current highest bid");
				}
				break;
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Product not found.");
		}
		else {
  			res.json(true);	
  		}	
	}
});

//REST Operation - HTTP GET to read bid history of a product by its id
app.get('/Server-Master/product/:id/bid-history', function(req, res) {
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT * from placed_bids natural join auctions where product_id = $1 order by bid_amount DESC", [id]);
	query.on("row", function (row, result) {
		result.addRow(row);
	});
	query.on("end", function (result) {
		console.log("GET bid history for product id " + id);
		var response = {"bidHistory" : result.rows};
		client.end();
		res.json(response);		
	});
});

//JUAN SEARCH TESTING
// REST Operation - HTTP GET to read a product based on user search input
app.get('/Server-Master/search/:input', function(req, res) {
	var search_input = req.params.input;

	console.log("GET search of " + search_input);
  	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT product_id, name, instant_price, image_filename, current_bid from products natural join auctions where name ILIKE '%"+search_input+"%'");
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		var response = {"ListOfProducts" : result.rows};
		console.log("row count: " + result.rowCount);
		client.end();
		res.json(response);
 	});
});
//JUAN SEARCH TESTING END

/*==================================================================*/
/*								Users								*/
/*==================================================================*/
var User = modules.User;

//type, username, password, firstname, lastname, email, shipAddress, billAddress
var userList = new Array(
	new User("user", "user1", "password", "FirstName", "LastName", "user1@rjn.com", "wat 123 Guaynabo, PR", "wat 123 Guaynabo, PR"),
	new User("user", "user2", "password", "FirstName", "LastName", "user2@rjn.com", "123 Mayawest, PR", "alextown 53 apt 1 San Juan, PR"),
	new User("user", "user3", "password", "FirstName", "LastName", "user3@rjn.com", "5 OPNESS Texas, USA", "5 OPNESS Texas, USA"),
	new User("admin", "admin1", "password", "FirstName", "LastName", "admin1@rjn.com")
	);
var userNextId = 0;

for (var i=0; i < userList.length;++i){
	userList[i].id = userNextId++;
}

/* Shipping Address List */
var ShipAddress = modules.ShippingAddress;

//user id, address
var shipAddressList = new Array(
	new ShipAddress(0, "wat 123 Guaynabo, PR"),
	new ShipAddress(2, "5 OPNESS Texas, USA"),
	new ShipAddress(1, "123 Mayawest, PR")
	);

var shipAddressNextId = 0;

for (var i=0; i < shipAddressList.length;++i){
	shipAddressList[i].id = shipAddressNextId++;
}

//SHIPADDRESS REST CALLS

// REST Operation - HTTP GET to read an address information based on its id
app.get('/Server-Master/account/address/:id', function(req, res) {
	var id = req.params.id;

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT * from addresses where address_id = $1", [id]);
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
    	if(result.rowCount == 0){
    		res.statusCode = 404;
    		res.send("Address information not found.");
    	}
    	else {
			var response = {"address" : result.rows[0]};
			client.end();
    		res.json(response);
    	}
 	});
});

// REST Operation - HTTP POST to add a new address
app.post('/Server-Master/account/address/:userId', function(req, res) {
	console.log("POST");
	
  	if(!req.body.hasOwnProperty('address')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for address.');
  	}

  	var newAddress = new ShippingAddress(userId,req.body.address);
  								 
  	console.log("New Address: " + JSON.stringify(newAddress));
  	newAddress.id = shipAddressNextId++;
  	shipAddressList.push(newAddress);
  	res.json(true);
});

//REST Operation - HTTP PUT to edit address based on its id
app.put('/Server-Master/account/address/:id', function(req, res) {
	var id = req.params.id;
		console.log("PUT address: " + id);

	if ((id < 0) || (id >= shipAddressNextId)){
		// not found
		res.statusCode = 404;
		res.send("Address not found.");
	}
	else if(!req.body.hasOwnProperty('address')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for address.');
  	}
	else {
		var target = -1;
		for (var i=0; i < shipAddressList.length; ++i){
			if (shipAddressList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Address not found.");			
		}	
		else {
			var theAddress= shipAddressList[target];
			theAddress.address = req.body.address;
			var response = {"address" : theAddress};
  			res.json(response);		
  		}
	}
});

//REST Operation - HTTP DELETE to delete address based on its id
app.del('/Server-Master/account/address/:id', function(req, res) {
	var id = req.params.id;
		console.log("DELETE address: " + id);

	if ((id < 0) || (id >= shipAddressNextId)){
		// not found
		res.statusCode = 404;
		res.send("Address not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < shipAddressList.length; ++i){
			if (shipAddressList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Address not found.");			
		}	
		else {
			shipAddressList.splice(target, 1);
  			res.json(true);
  		}		
	}
});
//SHIPADDRESS REST CALLS END

/* Payment Options List */
var PaymentType = modules.PaymentType;

//user id, card info
var payTypeList = new Array(
	new PaymentType("0", "creditcard", "0123-4567-89AB-CDEF", "wat 123 Guaynabo, PR"),
	new PaymentType("0", "creditcard", "FEDC-BA98-7654-3210", "wat 123 Guaynabo, PR")
	);

var paymentNextId = 0;

for (var i=0; i < payTypeList.length;++i){
	payTypeList[i].id = paymentNextId++;
}

//PAYMENT REST CALLS

// REST Operation - HTTP GET to read an payment information based on its id
app.get('/Server-Master/account/payment/:id', function(req, res) {
	var id = req.params.id;
		console.log("GET payment information: " + id);

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT * from payment_options where payment_id = $1", [id]);
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
    	if(result.rowCount == 0){
    		client.end();
    		res.statusCode = 404;
    		res.send("Payment information not found.");
    	}
    	else {
			var response = {"payment" : result.rows[0]};
			client.end();
    		res.json(response);
    	}
 	});
});

// REST Operation - HTTP POST to add a new payment
app.post('/Server-Master/account/payment/:userId', function(req, res) {
	console.log("POST");
	
  	if(!req.body.hasOwnProperty('type')||!req.body.hasOwnProperty('cNumber')||!req.body.hasOwnProperty('billAddress')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for payment.');
  	}

  	var newPayment = new PaymentType(userId,req.body.type,req.body.cNumber,req.body.billAddress);
  								 
  	console.log("New Payment: " + JSON.stringify(newPayment));
  	newPayment.id = paymentNextId++;
  	payTypeList.push(newPayment);
  	res.json(true);
});

//REST Operation - HTTP PUT to edit payment based on its id
app.put('/Server-Master/account/payment/:id', function(req, res) {
	var id = req.params.id;
		console.log("PUT payment: " + id);

	if ((id < 0) || (id >= paymentNextId)){
		// not found
		res.statusCode = 404;
		res.send("Payment not found.");
	}
	else if(!req.body.hasOwnProperty('type')||!req.body.hasOwnProperty('cNumber')||!req.body.hasOwnProperty('billAddress')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for payment.');
  	}
	else {
		var target = -1;
		for (var i=0; i < payTypeList.length; ++i){
			if (payTypeList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Payment not found.");			
		}	
		else {
			var thePayment= payTypeList[target];
			thePayment.type = req.body.type;
			thePayment.cNumber = req.body.cNumber;
			thePayment.billAddress = req.body.billAddress;
			var response = {"payment" : thePayment};
  			res.json(response);		
  		}
	}
});

//REST Operation - HTTP DELETE to delete payment based on its id
app.del('/Server-Master/account/payment/:id', function(req, res) {
	var id = req.params.id;
		console.log("DELETE payment: " + id);

	if ((id < 0) || (id >= paymentNextId)){
		// not found
		res.statusCode = 404;
		res.send("Payment not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < payTypeList.length; ++i){
			if (payTypeList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Payment not found.");			
		}	
		else {
			payTypeList.splice(target, 1);
  			res.json(true);
  		}		
	}
});

//PAYMENT REST CALLS END

/* User Ratings List */
var Rating = modules.Rating;

//id, seller id, rater id, rating
var ratingsList = new Array(
	new Rating (0, 1, 4),
	new Rating (0, 2, 0),
	new Rating (1, 0, 3),
	new Rating (2, 2, 2)
	);

var ratingsNextId = 0;

for (var i=0; i < ratingsList.length;++i){
	ratingsList[i].id = ratingsNextId++;
}

// REST Operation - HTTP POST to add a new a user
app.post('/Server-Master/register', function(req, res) {
	console.log("POST new user");
/*
  	if( !req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('firstname') ||
  		!req.body.hasOwnProperty('lastname') || !req.body.hasOwnProperty('email') ||
  		!req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('middleinitial')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for new user.');
  	}*/
  	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query1 = client.query("SELECT username from accounts where username = '"+req.body.username+"'");
	query1.on("row", function (row, result){
		result.addRow(row);
	});
	query1.on("end", function (result){
		if(result.rowCount != 0){
			client.end();
			res.statusCode = 409; // is this the correct code for when username already exists?
  			return res.send('Error: A user by this username already exists.');
		}
		else {
			var values = "'"+req.body.firstname+"', '"+req.body.middleinitial+"', '"+req.body.lastname+"', '"+req.body.email+"', FALSE, "+req.body.username+"', '"+req.body.password+"'";
			var query2 = client.query("INSERT INTO accounts (first_name, middle_initial, last_name, email, permission, username, password) values ($1)", values);
			console.log("New User: " + req.body.username);
			client.end();
	  		res.json(true);
		}
	});
});

// REST Operation - HTTP POST to login user
app.post('/Server-Master/home/:username', function(req, res) {
	console.log("POST login attempt: " + req.params.username);

  	if(!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password') ) {
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for user login.');
  	}
	else {
		var userName = req.body.username;
  		var passWord = req.body.password;
  		var foundUser, foundPassword = false;

  		var client = new pg.Client(dbConnInfo);
  		client.connect();

  		var query = client.query("SELECT * from accounts where username = $1", [userName]);
  		query.on("row", function (row, result){
  			result.addRow(row);
  		});
  		query.on("end", function (result){
  			if(result.rowCount == 0){
  				// not found
  				client.end();
  				res.statusCode = 404;
				res.send("User not found.");
  			}
  			else {
  				foundUser = true;
  				var theUser = result.rows[0];
  				if(passWord == theUser.password){
  					//Future work: create global userCount variable and add userCount++ here to see how many users are currently logged in
					console.log("Succesful login of user id: " + theUser.account_id + " of type: " + theUser.permission);
					var response = {"user" : theUser};
					client.end();
					res.json(response);	
  				}
				else {
					client.end();
					res.statusCode = 409;
					res.send("Username exists but entered password does not match");
				}
			}
  		});
	}
});

// REST Operation - HTTP GET to read a admin account based on its id
app.get('/Server-Master/admin/:id', function(req, res){
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	//variables for data to be returned
	var theAdmin, theCategories, theUsers; 

/*	var query = client.query("SELECT * from accounts where account_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result){
		if(result.rowCount == 0){
			// not found
			client.end();
			res.statusCode = 404;
			res.send("Admin not found.");
		}
		else {
			theAdmin = result.rows;
			console.log("GET admin account: " + id);
		}
	});*/

	var query2 = client.query("SELECT cid, cname from categories");
	query2.on("row", function (row, result){
		result.addRow(row);
	});
	query2.on("end", function (result){
		theCategories = result.rows;
	});

	var query3 = client.query("SELECT account_id, username from accounts");
	query3.on("row", function (row, result){
		result.addRow(row);
	});
	query3.on("end", function (result){
		theUsers = result.rows;
		var response = {"adminInfo" : theAdmin, "categoriesList": theCategories, "userList" : theUsers};
		client.end();
		res.json(response);
	});
});

// REST Operation - HTTP GET to read report based on reportType
app.get('/Server-Master/admin/:id/report/:reportType', function(req, res){
	var id = req.params.id;
	var reportType = req.params.reportType;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	console.log("GET report " + reportType);
	var query, theReport;
	//
	if(reportType == "by Total Sales"){
		query = client.query("SELECT purchase_date, count(*) as sales from sales natural join orders group by purchase_date order by purchase_date DESC");
	}
	else if (reportType == "by Products") {
		query = client.query("SELECT name, count(product_id) as sales from sales natural join orders natural join products group by name order by sales DESC");
	}
	else {
		query = client.query("SELECT purchase_date, sum(purchase_price) as revenue, count(order_id) as sales from sales natural join orders group by purchase_date order by purchase_date DESC");
	}
	query.on('row', function (row, result){
		result.addRow(row);
	});
	query.on('end', function (result){
		theReport = result.rows;
		var response = {"report" : theReport};
		client.end();
		res.json(response);
	});
});

// REST Operation - HTTP GET to read a seller profile based on its id
app.get('/Server-Master/seller/:id', function(req, res) {
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var theSeller, theRatings, ratings_percentage, theProducts;
	// get seller's basic information
	var query = client.query("SELECT username, email, description from accounts where account_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result){
		if(result.rowCount == 0){
			// not found
			res.statusCode = 404;
			res.send("Seller not found.");
		}
		else {
			console.log("GET seller: " + id);
			theSeller = result.rows[0];
		}
	});

    // Query to get ratings for this seller
	var query2 = client.query("SELECT username, rating from sales natural join orders natural join products, accounts where buyer_id = account_id and seller_id = $1", [id]);
	query2.on("row", function (row, result){
		result.addRow(row);
	});
	query2.on("end", function (result){
		theRatings = result.rows;
	});

	// Query to get products being sold by this seller
	var query3 = client.query("SELECT product_id, name, quantity from products where seller_id = $1", [id]);
	query3.on("row", function (row, result){
		result.addRow(row);
	});
	query3.on("end", function (result){
		theProducts = result.rows;
	});

	// Query to get % of ratings by rating value
	var query4 = client.query("SELECT rating, (round(100.0*count(*)/num_of_ratings::numeric,2) || '%') as percentage from (SELECT count(*) as num_of_ratings from sales natural join products where seller_id = $1) as r, sales natural join orders natural join products, accounts where buyer_id = account_id and seller_id = $2 group by rating, num_of_ratings order by rating DESC", [id, id]);
	query4.on("row", function (row, result){
		result.addRow(row);
	});
	query4.on("end", function (result){
		ratings_percentage = result.rows;
		var response = {"seller" : theSeller, "ratings" : theRatings, "ratings_percentage" : ratings_percentage, "selling" : theProducts};
		client.end();
		res.json(response);
	});
});

//REST Operation - HTTP POST to set rating on product sale for a seller by id
app.post('/Server-Master/seller/:id', function(req, res) {
	var id = req.params.id;
	console.log("POST rating on seller id " + id);

	var rating = req.body.rating;
	var rater = req.body.rater;

	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("Seller not found.");
	}
	else {
		//id, seller id, rater id, rating
	  	var newRating = new Rating(id,rater,rating);
	  								 
	  	console.log("New Rating: " + JSON.stringify(newRating));
	  	newRating.id = ratingsNextId++;
	  	ratingsList.push(newRating);
	  	res.json(true);
	}
});

// REST Operation - HTTP GET to read a user account based on its id
app.get('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var theUser, theAddresses, thePaymentOptions, theRatings, theBids, theProducts, theProductsBought, theProductsSold, theOrders;
	//returns user profile information
	var query = client.query("SELECT * from accounts where account_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result){
		if(result.rowCount == 0){
			client.end();
			res.statusCode = 404;
			res.send("User not found.");
		}
		else{
			console.log("GET user account: " + id);
			theUser = result.rows[0];
		}
	});
	//returns user addresses
	var query2 = client.query("SELECT * from addresses where account_id = $1", [id]);
	query2.on("row", function (row, result){
		result.addRow(row);
	});
	query2.on("end", function (result){
		theAddresses = result.rows;
	});
	//returns the ratings list for user
	var query3 = client.query("SELECT username, rating from sales natural join orders natural join products, accounts where buyer_id = account_id and seller_id = $1",[id]);
	query3.on('row', function (row, result){
		result.addRow(row);
	});
	query3.on('end', function (result){
		theRatings = result.rows;
	});

	//returns products being sold by user
	var query4 = client.query("SELECT product_id, name, quantity from products where seller_id = $1",[id]);
	query4.on('row', function (row, result){
		result.addRow(row);
	});
	query4.on('end', function (result){
		theProducts = result.rows;
	});

	//returns current bids user has on a product
	var query5 = client.query("SELECT product_id, products.name, bid_amount, current_bid, date_placed from placed_bids natural join auctions natural join products where bidder_id = $1", [id])
	query5.on('row', function (row, result){
		result.addRow(row);
	});
	query5.on('end', function (result){
		theBids = result.rows;
	});

	//returns products bought in the past
	//have it return necesary info link to invoice and an order summary panel or page
	var query6 = client.query("SELECT order_id, seller_id, username from orders natural join sales natural join products, accounts where seller_id = account_id and buyer_id = $1", [id]);
	query6.on('row', function (row, result){
		result.addRow(row);
	});
	query6.on('end', function (result){
		theProductsBought = result.rows;
	});

	//returns products sold in the past
	//have it return necesary info linking to user and sale details.
	var query7 = client.query("SELECT * from orders natural join sales natural join products where seller_id = $1", [id]);
	query7.on('row', function (row, result){
		result.addRow(row);
	});
	query7.on('end', function (result){
		theProductsSold = result.rows;
	});

	//returns the user's current orders
/*	var query8 = client.query("SELECT * from orders where buyer_id = $1", [id]);
	query8.on('row', function (row, result){
		result.addRow(row);
	});
	query8.on('end', function (result){
		theCurrentOrders = result.rows;
	});*/

	//returns user payment options 
	var query9 = client.query("SELECT * from payment_options natural join credit_cards natural join addresses where account_id = $1", [id]);
	query9.on("row", function (row, result){
		result.addRow(row);
	});
	query9.on("end", function (result){
		thePaymentOptions = result.rows;
		var response = {"user" : theUser, "shippingAddresses" : theAddresses, "paymentOptions" : thePaymentOptions, 
				"ratingsList" : theRatings, "bids" : theBids, "sellingProducts" : theProducts, "boughtHistory" : theProductsBought, "soldHistory" : theProductsSold};
		client.end();
		res.json(response);	
	});
});

// REST Operation - HTTP PUT to updated an account based on its id
app.put('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
		console.log("PUT user account: " + id);
	//Future Work: Take into account changing username, and that the new username might already be taken
	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("User not found.");
	}
	//Future Work: Take into consideration the being able to change username and password in Phase 2
	else if(!req.body.hasOwnProperty('firstname') || !req.body.hasOwnProperty('lastname') ||
		    !req.body.hasOwnProperty('email')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for user account.');
  	}
	else {
		var target = -1;
		for (var i=0; i < userList.length; ++i){
			if (userList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("User not found.");			
		}	
		else {
			var theUser= userList[target];
			theUser.firstname = req.body.firstname;
			theUser.lastname = req.body.lastname;
			theUser.email = req.body.email;
			var response = {"user" : theUser};
  			res.json(response);		
  		}
	}
});

//REST Operation - HTTP DEL for deleting user
app.del('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
		console.log("DELETE account: " + id);

	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("User not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < userList.length; ++i){
			if (userList[i].id == id){
				target = i;
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("User not found.");			
		}	
		else {
			userList.splice(target, 1);
  			res.json(true);
  		}		
	}
});

// REST Operation - HTTP GET to get order information
app.get('/Server-Master/account/orders/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET order "+id);

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT order_id, purchase_date, payment_option, product_id, name, s.street_address ||' '||s.city||' '||s.country||' '||s.state||' '||s.zipcode as shipping_address, seller_id, username as seller, bought_quantity, purchase_price, card_number, b.street_address ||' '||b.city||' '||b.country||' '||b.state||' '||b.zipcode as billing_address from orders natural join sales natural join products, accounts, credit_cards, addresses as b, addresses as s where seller_id = accounts.account_id and orders.payment_option = credit_cards.payment_id and credit_cards.billing_address = b.address_id and shipping_option = s.address_id and order_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result){
		if(result.rowCount ==0){
			client.end();
			res.statusCode = 404;
		}
		else{
			var response = {"order" : result.rows[0]};
			client.end();
			res.json(response);
		}
	});
});

//NOT FINISHED. NEEDS to implement checkout function a
// REST Operation - HTTP POST for an order's checkout 
app.post('/Server-Master/orders', function (res, req) {

	var theUser, theOrder; // query the user's required info into here or get it from client side through req.body values.

	// code For emailing 
	// setup e-mail data with unicode symbols
/*	var mailOptions = {
	    from: "RJNBAY <rjnbay@gmail.com>", // sender address
	    to: "" + theUser.email, // list of receivers
	    subject: "Order summary for Order ID: " + theOrder.order_id, // Subject line
	    text: "Thank you for your purchase!", // plaintext body
	    html: "<h3>Thank you for your purchase "+theUser.first_name+"!</h3><h4>Made on " +theOrder.purchase_date+ "</h4><p><strong>Shipped to: </strong>"+theOrder.shipping_address+"</p><p><strong>Billed to Card Ending with </strong>"+ order.card_number.substr(15)+"</p><p><strong>Billing Address: </strong>"+order.billing_address+"</p>" // html body
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("Message sent: " + response.message);
		}
	});*/
});

// Mailer settings to email order summary information
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "rjnbay@gmail.com",
        pass: "RJNBAYdatabase"
    }
});

// Server starts running when listen is called.
app.use(express.static(__dirname + '/RJN-Master'));
app.listen(process.env.PORT || 3412);
console.log("server listening");

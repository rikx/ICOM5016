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

	var query = client.query("SELECT cid AS id, cname AS name FROM categories WHERE cparent IS NULL");
	
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

app.get('/Server-Master/categories/all', function(req, res) {
	console.log("GET all categories");

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT names.cname AS parent, categories.cname AS name, categories.cid AS id FROM categories full outer join (select cid, cname from categories) AS names ON categories.cparent = names.cid WHERE categories.cid IS NOT NULL ORDER BY parent NULLS FIRST, name");
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		// Do we want this msg? 
		if(result.rowCount == 0){
			client.end();
			res.statusCode = 404;
    		res.send("No categories found.");
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
	console.log("GET category: " + id);

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT * from categories where cid = $1", [id]);
	
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
			var response = {"category" : result.rows[0]};
			client.end();
    		res.json(response);
    	}
 	});
});

// REST Operation - HTTP POST to add a new a category
app.post('/Server-Master/admin/add-category', function(req, res) {
	console.log("POST category");

  	if(!req.body.hasOwnProperty('name') ){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for category.');
  	}

    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query;
	if(req.body.parent_category != null && req.body.parent_category != 'NONE'){
		query = client.query("INSERT INTO categories (cname, cparent) VALUES ('"+req.body.name+"', "+req.body.parent_category+")");
	}
	else {
		query = client.query("INSERT INTO categories (cname) VALUES ($1)", [req.body.name]);
	}
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		// error code if category exists
/*		res.statusCode = 404;
		res.send("Category already exists");*/
		client.end();
		res.json(true);
 	});
});

// REST Operation - HTTP PUT to updated a category based on its id
app.put('/Server-Master/admin/edit-category/:cid', function(req, res) {
	var cid = req.params.cid;
		console.log("PUT category: " + cid);

	if(!req.body.hasOwnProperty('edit_cname')){
		res.statusCode = 400;
     	return res.send('Error: Missing fields for category.');
   	}
 	else {
			var client = new pg.Client(dbConnInfo);
  		  	client.connect();
  		  	
  		  	//--Category Info--//
			var cname = req.body.edit_cname.replace(/'/g,"''");
			
			//--Category Update Query--//
			var query = client.query('UPDATE categories SET cname = $1 WHERE cid = $2',
			[cname, cid]);
			
			query.on("row", function (row, result){
			result.addRow(row);
			});
		
			query.on("end", function (result){
			console.log("New Category info: "+ cname);
			client.end();
			res.json(true);
			});

	}
});

// REST Operation - HTTP DELETE to delete a category based on its id
app.del('/Server-Master/home/:id', function(req, res) {
	var id = req.params.id;
	console.log("DELETE category: " + id);

	var client = new pg.Client(dbConnInfo);
	client.connect();

	//update all products that have the category as it's parent
	var query1 = client.query("UPDATE products SET cid = (SELECT cparent FROM categories WHERE cid = $1) WHERE cid = $1", [id]);
	query1.on("row", function (row, result){
		result.addRow(row);
	});
	query1.on("end", function (err, result) {
		console.log("Updated products belonging to category: " + id);
	});
	//update all children of the category
	var query2 = client.query('UPDATE categories SET cparent = (SELECT cparent FROM categories WHERE cid = $1) WHERE cparent = $1', [id]);
	query2.on("row", function (row, result){
		result.addRow(row);
	});
	query2.on("end", function (err, result) {
  			console.log("Updated children belonging to category: " + id);
   	});

	//delete the category entry
	var query3 = client.query("DELETE FROM categories WHERE cid = $1", [id]);
	query3.on("row", function (row, result){
		result.addRow(row);
	});
	query3.on("end", function (err, result) {
    		client.end();
  			console.log("Deleted category: " + id);
  			res.json(true);
  	});
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
			var query1 = client.query("SELECT product_id, name, instant_price, cid as parent, image_filename, cname as parent_name, current_bid, auction_id from auctions natural join products natural join categories where cid = $1 AND cid IS NOT NULL", [id]);
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

// REST Operation - HTTP GET to read a product based on its id
app.get('/Server-Master/product/:id', function(req, res) {
	var id = req.params.id;

	var client = new pg.Client(dbConnInfo);
	client.connect();
	
	// Query to get product information. 
	// second query checks if the product is up for auction, then adds info to the response
	// if product is up for auction, third query checks number of bids and adds info to the response
	var theProduct;

	console.log("Fetching product: "+id);
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
app.post('/Server-Master/product/:sellerID', function(req, res) {
	console.log("POST new product");

  	if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('model')||!req.body.hasOwnProperty('brand')||!req.body.hasOwnProperty('description')
			||!req.body.hasOwnProperty('parent_category')||!req.body.hasOwnProperty('quantity')||!req.body.hasOwnProperty('dimensions')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for product.');
  	}

  	// need to take into account if a product being added has the same seller;
  	var sellerID = req.params.sellerID;
  	//avoids error with name that has apostrophes
  	var name = req.body.name.replace(/'/g,"''"); 
	var model = req.body.model.replace(/'/g,"''"); 
	var brand = req.body.brand.replace(/'/g,"''"); 
	var description = req.body.description.replace(/'/g,"''");
	var dimensions = req.body.dimensions.replace(/'/g,"''"); 

  	var client = new pg.Client(dbConnInfo);
	client.connect();

	var buyout_price = req.body.buyout_price;
  	var current_bid = req.body.auc_bid_price;

	var auction_exist = false; 
  	if(current_bid > 0) {
  		auction_exist = true;
		buyout_price = req.body.auc_buyout_price;
  	}
  	var new_product = "'"+name+"', "+"'"+model+"', "+"'"+brand+"', "+"'"+description+"', "+req.body.parent_category+
  	", "+sellerID+", "+req.body.quantity+", '"+dimensions+"', "+buyout_price+"";
  	console.log("Product values: "+new_product);

// not sure why this version isnt working. it should woek.
/*	var query = client.query("INSERT INTO products (name, cid, seller_id) VALUES ($1)", [new_product], function(err, result) {
		client.end();
		console.log("New Product: " + new_product);
		res.json(true);
  	});*/
	var product_id = 0;
	var query1 = client.query("INSERT INTO products (name, model, brand, description, cid, seller_id, quantity, dimensions, instant_price) VALUES ("+new_product+")");
	query1.on("row", function (row, result){
		result.addRow(row);
	});
	query1.on("end", function (err, result) {
		//error handling is also acting funky.
/*	   	if(err){
			res.statusCode = 400;
    		return res.send('Error inserting product to db');
    	}
    	else{*/
    	//}
  	});
    var query2 = client.query("SELECT product_id FROM products WHERE cid IS NOT NULL ORDER BY product_id DESC");
	query2.on("row", function (row, result){
		result.addRow(row);
	});
	query2.on("end", function (result){
		product_id = result.rows[0].product_id;
		console.log("New Product: " + product_id);
		if(auction_exist == true){
		  	var new_auction = ""+sellerID+", "+product_id+", "+current_bid+"";
			var query3 = client.query("INSERT INTO auctions (seller_id, product_id, current_bid) VALUES ("+new_auction+")");
			query3.on("row", function (row, result){
				result.addRow(row);
			});
			query3.on("end", function (result){
				console.log("New auction for product "+ name);
				client.end();
	  			res.json(true);
			});
		}
		else{
			client.end();
			res.json(true);
		}
	});
});

//REST Operation - HTTP PUT to edit product based on its id
app.put('/Server-Master/account/product/:product_id', function(req, res) {
	var product_id = req.params.product_id;
	console.log("PUT product: " + product_id);
	
	if(!req.body.hasOwnProperty('edit_name')||!req.body.hasOwnProperty('edit_instant_price')||!req.body.hasOwnProperty('edit_model')
	||!req.body.hasOwnProperty('edit_brand')||!req.body.hasOwnProperty('edit_description')||!req.body.hasOwnProperty('edit_image_filename')
	||!req.body.hasOwnProperty('edit_quantity')||!req.body.hasOwnProperty('edit_dimensions')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for product.');
  	}
  	else{
  			var client = new pg.Client(dbConnInfo);
  		  	client.connect();
  		  	
  		  	//--Product Info--//
  		  	var name = req.body.edit_name.replace(/'/g,"''");
			var instant_price = req.body.edit_instant_price.replace(/'/g,"''");
			var model = req.body.edit_model.replace(/'/g,"''");
			var brand = req.body.edit_brand.replace(/'/g,"''");
			var description = req.body.edit_description.replace(/'/g,"''");
			var image_filename = req.body.edit_image_filename.replace(/'/g,"''");
			var quantity = req.body.edit_quantity.replace(/'/g,"''");
			var dimensions = req.body.edit_dimensions.replace(/'/g,"''");
			
			//--Product Update Query--//
			var query = client.query('UPDATE products SET name = $1, instant_price = $2, model = $3, brand = $4, description = $5, image_filename = $6, quantity = $7, dimensions = $8 WHERE product_id = $9',
			[name, instant_price, model, brand, description, image_filename, quantity, dimensions, product_id]);
			
			query.on("row", function (row, result){
			result.addRow(row);
			});
		
			query.on("end", function (result){
			console.log("New Product info: "+ name +": " + instant_price +": " + model +": " + brand +": " + description +": " + image_filename +": " + quantity +": " + dimensions);
			client.end();
			res.json(true);
			});
	}
});

//REST Operation - HTTP DELETE to delete product based on its id
app.del('/Server-Master/product/:id', function(req, res) {
	var id = req.params.id;
	console.log("DELETE product: " + id);

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("UPDATE products SET cid = DEFAULT WHERE product_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (err, result) {
    		client.end();
  			console.log("Deleted Product: " + id);
  			res.json(true);
    	//}
  	});

});

//REST Operation - HTTP POST to update current bid on product by id
app.post('/Server-Master/home/product/:id/bid', function(req, res) {
	var product_id = req.params.id;
	var auction_id = req.body.auction_id;
	var bidder_id = req.body.bidder_id;
	console.log("POST bid on product id " + product_id + " of auction " +  auction_id +" by user " + bidder_id);

	var client = new pg.Client(dbConnInfo);
	client.connect();
	
	//-- New Bid Info --//
	var date_placed = new Date();
	var dd = date_placed.getDate();
	var mm = date_placed.getMonth()+1;
	
	var yyyy = date_placed.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} date_placed = mm+'/'+dd+'/'+yyyy;
	
	var bid_amount = req.body.new_current_bid;
	
	//-- New Bid Queries --//
	var query = client.query("INSERT into placed_bids (bidder_id, auction_id, bid_amount, date_placed) VALUES ('"+bidder_id+"', '"+auction_id+"', '"+bid_amount+"', '"+date_placed+"')");
  	query.on("row", function (row, result){
  		result.addRow(row);
  	});
	var query2 = client.query('UPDATE auctions SET current_bid = $1 WHERE product_id = $2', [bid_amount, product_id]);
	query2.on("row", function (row, result) {
		result.addRow(row);
	});
	
	query2.on("end", function (result) {
		console.log("POST new Bid on Product " + product_id);
		client.end();
		res.json(true);
	});
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

	var query = client.query("SELECT * from (SELECT products.product_id, name, instant_price, image_filename, current_bid from products FULL OUTER JOIN auctions ON products.product_id = auctions.product_id) as results WHERE name ILIKE '%"+search_input+"%'");
	
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

// REST Operation - HTTP GET to read an address information based on its id
app.get('/Server-Master/account/address/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET address: " + id);
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
app.post('/Server-Master/account/address/:id', function(req, res) {
	console.log("POST address");
	var account_id = req.params.id;

  	if(!req.body.hasOwnProperty('street_address') || !req.body.hasOwnProperty('city') || !req.body.hasOwnProperty('country')
  		|| !req.body.hasOwnProperty('state') || !req.body.hasOwnProperty('zipcode')){	
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for address.');
  	}

  	var street_address = req.body.street_address.replace(/'/g,"''"); 
	var city = req.body.city.replace(/'/g,"''"); 
	var country = req.body.country.replace(/'/g,"''"); 
	var state = req.body.state.replace(/'/g,"''");
  	
  	var new_address = "'"+street_address+"', '"+city+"', '"+country+"', '"+state+"', '"+req.body.zipcode+"', "+account_id;
  	console.log(new_address);
  	var client = new pg.Client(dbConnInfo);
	client.connect();

  	var query = client.query("INSERT into addresses (street_address, city, country, state, zipcode, account_id) VALUES ('"+street_address+"', '"+city+"', '"+country+"', '"+state+"', '"+req.body.zipcode+"', "+account_id+")");
  	query.on("row", function (row, result){
  		result.addRow(row);
  	});
  	query.on("end", function (result){
  		//error code here
	  	console.log("New Address: " + new_address);
	  	client.end();
  		res.json(true);
  	})							 
});

//REST Operation - HTTP PUT to edit address based on its id
app.put('/Server-Master/account/address/:address_id', function(req, res) {
	
	var address_id = req.params.address_id;
	console.log("PUT address: " + address_id);

	/*if ((id < 0) || (id >= shipAddressNextId)){
		// not found
		res.statusCode = 404;
		res.send("Address not found.");
	}*/	
	if(!req.body.hasOwnProperty('edit_street_address')||!req.body.hasOwnProperty('edit_city')||!req.body.hasOwnProperty('edit_country')
	||!req.body.hasOwnProperty('edit_state')||!req.body.hasOwnProperty('edit_zipcode')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for address.');
  	}
  	else{
  	var street_address = req.body.edit_street_address.replace(/'/g,"''");
	var city = req.body.edit_city.replace(/'/g,"''");
	var country = req.body.edit_country.replace(/'/g,"''");
	var state = req.body.edit_state.replace(/'/g,"''");
	var zipcode = req.body.edit_zipcode.replace(/'/g,"''");
	
	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query('UPDATE addresses SET street_address = $1, city = $2, country = $3, state = $4, zipcode = $5 WHERE address_id = $6', [street_address,city,country,state,zipcode,address_id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result){
		console.log("New Address for user "+street_address+": " + city+": " + country+": " + state+": " + zipcode);
		client.end();
		res.json(true);
	});
	}
});

//REST Operation - HTTP DELETE to delete address based on its id
app.del('/Server-Master/address/:id', function(req, res) {
	var id = req.params.id;
	console.log("DELETE address: " + id);

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("UPDATE addresses SET account_id = DEFAULT WHERE address_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (err, result) {
    		client.end();
  			console.log("Deleted Address: " + id);
  			res.json(true);
    	//}
  	});
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

	var query = client.query("SELECT * from credit_cards full outer join bank_accounts on credit_cards.payment_id = bank_accounts.payment_id where bank_accounts.payment_id = $1 or credit_cards.payment_id = $1", [id]);
	
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
app.post('/Server-Master/account/payment/:id', function(req, res) {
	console.log("POST payment");
	
	var client = new pg.Client(dbConnInfo);
  	client.connect();
  	
  	var payment_type = "1";
  	if(req.body.account_number != ""){
  		payment_type = "2";
  	}
  	var account_id = req.params.id;
	var query1 = client.query("INSERT INTO payment_options (account_id, payment_type) VALUES ("+account_id+", '"+payment_type+"')");
	query1.on("row", function (row, result){
		result.addRow(row);
	});
	query1.on("end", function (result){
		//error code
	});
	var query2 = client.query("SELECT payment_id FROM payment_options ORDER BY payment_id DESC");
	query2.on("row", function (row, result){
		result.addRow(row);
	});
	query2.on("end", function (result){
		var payment_id = result.rows[0].payment_id;
		var query3;
		var values;
		if(payment_type == "2"){
			values = ""+payment_id+", '"+req.body.account_number+"', '"+req.body.routing_number+"', '"+req.body.b_account_type+"'";
			query3 = client.query("INSERT INTO bank_accounts (payment_id, account_number, routing_number, b_account_type) VALUES ("+values+")");
		}
		else {
			console.log(req.body.address_id);
			values = ""+payment_id+", '"+req.body.card_number+"', '"+req.body.card_holder+"', '"+req.body.exp_month+"', '"+req.body.exp_year+"', '"+req.body.security_code+"', '"+req.body.address_id+"'";
			query3 = client.query("INSERT INTO credit_cards (payment_id, card_number, card_holder, exp_month, exp_year, security_code, billing_address) VALUES ("+values+")");
		}
		console.log(values);
		query3.on("row", function (row, result){
			result.addRow(row);
		});
		query3.on("end", function (result){
			console.log("Payment option of type "+payment_type+" added");
		  	client.end();
	  		res.json(true);
		});
	});
});

//REST Operation - HTTP PUT to edit payment based on its id
app.put('/Server-Master/account/payment/:payment_id', function(req, res) {
	var payment_id = req.params.payment_id;
	console.log("PUT payment: " + payment_id);
	
	if(!req.body.hasOwnProperty('edit_card_number')||!req.body.hasOwnProperty('edit_card_holder')||!req.body.hasOwnProperty('edit_exp_month')
	||!req.body.hasOwnProperty('edit_exp_year')||!req.body.hasOwnProperty('edit_security_code')||!req.body.hasOwnProperty('edit_account_number')
	||!req.body.hasOwnProperty('edit_routing_number')||!req.body.hasOwnProperty('edit_b_account_type')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for payment.');
  	}
  	else{
  			var client = new pg.Client(dbConnInfo);
  		  	client.connect();
  		  	
  		  	//--Card Info--//
  		  	var card_number = req.body.edit_card_number.replace(/'/g,"''");
			var card_holder = req.body.edit_card_holder.replace(/'/g,"''");
			var exp_month = req.body.edit_exp_month.replace(/'/g,"''");
			var exp_year = req.body.edit_exp_year.replace(/'/g,"''");
			var security_code = req.body.edit_security_code.replace(/'/g,"''");
			
			//--Bank Info--//
			var account_number = req.body.edit_account_number.replace(/'/g,"''");
			var routing_number = req.body.edit_routing_number.replace(/'/g,"''");
			var b_account_type = req.body.edit_b_account_type.replace(/'/g,"''");
			
			//--Card Update Query--//
			var query = client.query('UPDATE credit_cards SET card_number = $1, card_holder = $2, exp_month = $3, exp_year = $4, security_code = $5 WHERE payment_id = $6',
			[card_number,card_holder,exp_month,exp_year,security_code,payment_id]);
			
			query.on("row", function (row, result){
			result.addRow(row);
			console.log("New Card info: "+card_number+": " + card_holder+": " + exp_month+": " + exp_year+": " + security_code);
			});
			
			//--Bank Update Query--//
			var query2 = client.query('UPDATE bank_accounts SET account_number = $1, routing_number = $2, b_account_type = $3 WHERE payment_id = $4',
			[account_number,routing_number,b_account_type,payment_id]);
			
			query2.on("row", function (row, result){
			result.addRow(row);
			console.log("New Bank info: "+account_number+": " + routing_number+": " + b_account_type);
			});
			query2.on("end", function (result){
			client.end();
			res.json(true);
			});
	}
});

//REST Operation - HTTP DELETE to delete payment based on its id
app.del('/Server-Master/payment/:id', function(req, res) {
	var id = req.params.id;
	console.log("DELETE payment: " + id);

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("UPDATE payment_options SET account_id = DEFAULT WHERE payment_id = $1", [id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (err, result) {
    		client.end();
  			console.log("Deleted payment option: " + id);
  			res.json(true);
    	//}
  	});
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

  	if( !req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('firstname') ||
  		!req.body.hasOwnProperty('lastname') || !req.body.hasOwnProperty('email') ||
  		!req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('middleinitial')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for new user.');
  	}

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

			//console.log("Entered password: "+req.body.password);
			var hashquery = client.query("SELECT crypt($1, gen_salt('md5'))", [req.body.password]);
			hashquery.on("row", function (row, result){
				result.addRow(row);
			});
			hashquery.on("end", function (result){
				var passhash = result.rows[0].crypt;
				console.log("New user hash: "+passhash);

				var values = "'"+req.body.firstname.replace(/'/g,"''")+"', '"+req.body.middleinitial+"', '"+req.body.lastname.replace(/'/g,"''")+"', '"+req.body.email.replace(/'/g,"''")+"', FALSE, '"+req.body.username+"', '"+passhash+"'";
			
				var query2 = client.query("INSERT INTO accounts (first_name, middle_initial, last_name, email, permission, username, password) values ("+values+")");
				query2.on("end", function (result){
					console.log("New User: " + req.body.username);
					client.end();
		  			res.json(true);
				});
			});
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

  		var userquery = client.query("SELECT * from accounts where username = $1", [userName]);
  		userquery.on("row", function (row, result){
  			result.addRow(row);
  			console.log("Found user, has id: ", result.rows[0].account_id);
  		});
  		userquery.on("end", function (result){
  			if(result.rowCount == 0){
  				// not found
  				client.end();
  				res.statusCode = 404;
				res.send("User not found.");
  			}
  			else {
  				foundUser = true;
  				var theUser = result.rows[0];

  				//console.log("Checking entered password: ", passWord);
				var passquery = client.query("SELECT (password = crypt($1, password)) AS hashcheck FROM accounts WHERE account_id = $2", [passWord, theUser.account_id]);
				passquery.on("row", function (row, result){
					result.addRow(row);
					//console.log("Hash query is: ", result.rows[0]);
				});
				passquery.on("end", function (result){
					var passchecks = result.rows[0].hashcheck;
					//console.log("CHECK(" + result.rows[0].hashcheck + "," + true + ")");
					if(passchecks == true){
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
				});

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

	var query2 = client.query("SELECT names.cname AS parent, categories.cname AS name, categories.cid AS id FROM categories full outer join (select cid, cname from categories) AS names ON categories.cparent = names.cid WHERE categories.cid IS NOT NULL ORDER BY parent NULLS FIRST, name");
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
	var query3 = client.query("SELECT product_id, name, quantity from products where seller_id = $1 AND cid IS NOT NULL", [id]);
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

//REST Operation - HTTP PUT to set rating on product sale for a seller by id
app.put('/Server-Master/seller/rating', function(req, res) {
	console.log("PUT rating");

	if(!req.body.hasOwnProperty('order_id')||!req.body.hasOwnProperty('product_id')||!req.body.hasOwnProperty('rating')){		
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for rating.');
  	}

	var rating = req.body.rating;
	var order = req.body.order_id;
	var product = req.body.product_id;

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query('UPDATE sales SET rating = $1 WHERE order_id = $2 and product_id = $3', [rating, order, product]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result){
/*		//need error handling code
		res.statusCode = 404;
		res.send("Sale not found.");*/
		console.log("New Rating for order "+order+": " + rating);
		client.end();
		res.json(true);
	});
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
	var query4 = client.query("SELECT product_id, name, quantity from products where seller_id = $1 AND cid IS NOT NULL",[id]);
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
	//have it return necesary info link to invoice 
	var query6 = client.query("SELECT order_id, seller_id, username, product_id, rating from orders natural join sales natural join products, accounts where seller_id = account_id and buyer_id = $1", [id]);
	query6.on('row', function (row, result){
		result.addRow(row);
	});
	query6.on('end', function (result){
		theProductsBought = result.rows;
	});

	//returns products sold in the past
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
	var query9 = client.query("SELECT * FROM payment_options NATURAL JOIN (SELECT payment_id, card_id, card_number, card_holder, exp_month, exp_year, security_code, address_id, street_address, city, country, state, zipcode FROM credit_cards FULL OUTER JOIN addresses ON billing_address = address_id) AS CCs WHERE account_id = $1", [id]);
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

// REST Operation - HTTP PUT to edit account based on its id
app.put('/Server-Master/account/:account_id', function(req, res) {
	var account_id = req.params.account_id;
	console.log("PUT user account: " + account_id);
	//Future Work: Take into account changing username, and that the new username might already be taken and require old password to change password
	
	if(!req.body.hasOwnProperty('edit_first_name')||!req.body.hasOwnProperty('edit_middle_initial')||!req.body.hasOwnProperty('edit_last_name')
		||!req.body.hasOwnProperty('edit_photo_filename')||!req.body.hasOwnProperty('edit_email')||!req.body.hasOwnProperty('edit_username')||!req.body.hasOwnProperty('edit_old_password')
		||!req.body.hasOwnProperty('edit_password')||!req.body.hasOwnProperty('edit_confirm_password')||!req.body.hasOwnProperty('edit_description')) {
				
    	res.statusCode = 400;
    	return res.send('Error: Missing or invalid fields for account.');
  	}
  	else{
  			var client = new pg.Client(dbConnInfo);
  		  	client.connect();
  		  	
  		  	//--Account Info--//
  		  	var first_name = req.body.edit_first_name.replace(/'/g,"''");
			var middle_initial = req.body.edit_middle_initial.replace(/'/g,"''");
			var last_name = req.body.edit_last_name.replace(/'/g,"''");
			var photo_filename = req.body.edit_photo_filename.replace(/'/g,"''");
			var email = req.body.edit_email.replace(/'/g,"''");
			var username = req.body.edit_username.replace(/'/g,"''");
			var description = req.body.edit_description.replace(/'/g,"''");
			
			//--Account Update Query--//

				//Query for correct password
				var passquery = client.query("SELECT (password = crypt($1, password)) AS hashcheck FROM accounts WHERE account_id = $2", [req.body.edit_old_password, account_id]);
				passquery.on("row", function (row, result){
					result.addRow(row);
					console.log("Hash query is: ", result.rows[0]);
				});
				passquery.on("end", function (result){
					var passchecks = result.rows[0].hashcheck;
					if(passchecks == true){

						//Query for getting new password hash
  						var hashquery = client.query("SELECT crypt($1, gen_salt('md5'))", [req.body.edit_password]);
						hashquery.on("row", function (row, result){
							result.addRow(row);
						});
						hashquery.on("end", function (result){

							var passhash = result.rows[0].crypt;
							//console.log("Edited password hash is: "+passhash);

							var password = passhash.replace(/'/g,"''");

							//Query to update the account data
							var query = client.query('UPDATE accounts SET first_name = $1, middle_initial = $2, last_name = $3, photo_filename = $4, email = $5, username = $6, password = $7, description = $8 WHERE account_id = $9',
								[first_name, middle_initial, last_name, photo_filename, email, username, password, description, account_id]);
			
							query.on("end", function (result){
								console.log("New account info: "+ first_name +": " + middle_initial +": " + last_name +": " + photo_filename +": " + email +": " + username +": " + password +": " + description);
								client.end();
								res.json(true);
							});
						});
  					}
					else {
						client.end();
						res.statusCode = 401;
						res.send("The password you entered is incorrect");
					}
				});
	}
});

//REST Operation - HTTP DELETE to delete account
app.del('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
	console.log("DELETE account: " + id);

	var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("UPDATE accounts SET password = $1 WHERE account_id = $2", ["DISABLED", id]);
	query.on("row", function (row, result){
		result.addRow(row);
	});
	query.on("end", function (result) {
    		client.end();
  			console.log("Account has been disabled: " + id);
  			res.json(true);
    	//}
  	});

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

// NOT FINISHED. NEEDS to implement checkout function a
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

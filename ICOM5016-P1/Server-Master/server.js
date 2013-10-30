// Express is the web framework 
var express = require('express');
var pg = require('pg');

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

//  PHASE 1 CODE
/*	var response = {"categories" : categoryList};
  	res.json(response);*/

//  PHASE 2 CODE
    var client = new pg.Client(dbConnInfo);
	client.connect();

	var query = client.query("SELECT cid as id, cname as name from categories where cparent IS NULL");
	
	query.on("row", function (row, result) {
    	result.addRow(row);
	});
	query.on("end", function (result) {
		var response = {"categories" : result.rows};
		console.log("row count: " + result.rowCount);
		client.end();
  		res.json(response);
 	});
});


// REST Operation - HTTP GET to read a category based on its id
app.get('/Server-Master/home/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET category: " + id);

	if ((id < 0) || (id >= categoryNextId)){
		// not found
		res.statusCode = 404;
		res.send("Category not found.");
	}
//  PHASE 1 CODE
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
			var response = {"category" : categoryList[target]};
  			res.json(response);	
  		}	
	}
//  PHASE 2 CODE
/*    else {
	    var client = new pg.Client(dbConnInfo);
		client.connect();

		var query = client.query("SELECT cid as id, cname as name from categories where id = $1", [id]);
		
		query.on("row", function (row, result) {
	    	result.addRow(row);
		});
		query.on("end", function (result) {
	    	if(result.rowCount == 0){
	    		res.statusCode = 404;
	    		res.send("Category not found.");
	    	}
	    	else {
				var response = {"category" : result.rows};
				console.log("row count: " + result.rowCount);
				client.end();
	    		res.json(response);
	    	}
	 	});
    }*/
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

	if ((id < 0) || (id >= categoryNextId)){
		// not found
		res.statusCode = 404;
		res.send("Category not found.");
	}
	else {
		var theType = true; // if remains true at end content of response is subcategories

//		PHASE 1 CODE
/*		var theChildren = new Array();
		var target = -1;
		for (var i=0; i < categoryList.length; ++i){
			if (categoryList[i].id == id){
				console.log("GET subcategories of category " + id);
				target = i;
			}
			if (categoryList[i].parent == id){
				theChildren.push(categoryList[i]);	
			}		
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Parent category not found.");			
		}
		else {
			if (theChildren.length <1){
				theType = false; //content of theChildren are products
				
				if(SortType=="none"){
					for (var i=0; i < productList.length; ++i){
						if (productList[i].parent == id){
							theChildren.push(productList[i]);
						}
					}
				}
				
				else if(SortType=="name"||SortType=="price"||SortType=="brand"){
					console.log("Trololol Sort Will Be Implemented in Phase 2 Have a Nice Day! :D");
					for (var i=0; i < productList.length; ++i){
						if (productList[i].parent == id){
							theChildren.push(productList[i]);
						}
					}
				}
				
				else{
					console.log("This is not supposed to happen... EVER!");
					for (var i=0; i < productList.length; ++i){
						if (productList[i].parent == id){
							theChildren.push(productList[i]);
						}
					}
				}
						
			}		
			var response = {"children" : theChildren, "parent" : categoryList[target], "childType" : theType};
			res.json(response);
		}
*/

//      PHASE 2 CODE
		var client = new pg.Client(dbConnInfo);
		client.connect();

		// Query code for getting category hierarchy of current subcategory
/*		var historyNames = {};
		var historyIDs = {"id0" : id};
		var hasParent = true;
		var newID = id;
		// While parent category is not null, get category name and add it to history string
		while(hasParent){
			var count = 0;
			var query = client.query("SELECT cname, cparent from categories where cid = $1", [newId]);
			query.on("row", function (row, result){
				result.addRow(row);
			});
			query.on("end", function (result){
				if(result.rows[0].cparent == null){
					hasParent = false;
				}
				else {
					newID = result.rows[0].cparent;
					historyNames.name+""+count = result.rows[0].cname;
					count++; 
					historyIDs.id+""+count = result.rows[0].cparent; 
					console.log("History: " + historyNames);
				}
			});
		}
*/
		// Query Code for getting subqueries
		var query = client.query("SELECT c1.cid as id, c1.cname as name, c1.cparent as parent, parent_name from categories as c1, (SELECT cid, cname as parent_name from categories where cid = $1) AS c2 where cparent = $2 and cparent = c2.cid", [id, id]);
		query.on("row", function (row, result) {
	    	result.addRow(row);
		});
		query.on("end", function (result) {
			// Responds with sub categories of id if they exist
			if(result.rowCount > 0){
				console.log("GET subcategories of " + id + " Sorted By: " + SortType);
				console.log("row count: " + result.rowCount);
				var response = {"categories" : result.rows, "type" : theType, "parent" : result.rows[0].parent_name};
				//, "historyNames" : historyNames, "historyIDs" : historyIDs};
				res.json(response);
				client.end();
			}
			// If there are no subcategories, it GETs the products of this subcategory and responds with them
			else {
				theType = false; //content of theChildren are products
				console.log("GET products of category " +id+ ", sorted by " + SortType);

				var query2;
				switch(SortType) {
					case "name":
				  		query2 = client.query("SELECT pid as id, pname as name, pinstant_price as instant_price, cid as parent, pimage_filename as image, cname as parent_name from products natural join categories where cid = $1 order by pname", [id]);
				  		break; 
				  	case "price":
				  		query2 = client.query("SELECT pid as id, pname as name, pinstant_price as instant_price, cid as parent, pimage_filename as image, cname as parent_name from products natural join categories where cid = $1 order by pinstant_price", [id]);
				  		break;
				  	case "brand":
				  		query2 = client.query("SELECT pid as id, pname as name, pinstant_price as instant_price, cid as parent, pimage_filename as image, cname as parent_name from products natural join categories where cid = $1 order by pbrand", [id]);
				  		break;
				  	default:
				  		query2 = client.query("SELECT pid as id, pname as name, pinstant_price as instant_price, cid as parent, pimage_filename as image, cname as parent_name from products natural join categories where cid = $1", [id]);
				};
				query2.on("row", function (row, result) {
			    	result.addRow(row);
				});
				query2.on("end", function (result) {
					if(result.rowCount == 0){
						res.statusCode = 404;
						res.send("Parent category not found.");	
					}
					else {
						console.log("row count: " + result.rowCount);
						var response = {"products" : result.rows, "type" : theType, "parent" : result.rows[0].parent_name};
						//, "historyNames" : historyNames, "historyIDs" : historyIDs};
						res.json(response);
						client.end();
					}
				});
			}
		});
	}
});

// REST Operation - HTTP GET to get category's parent id
app.get('/Server-Master/subCategory/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET subCategory: " + id);

//  PHASE 1 CODE	
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
			}	
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Parent category not found.");			
		}	
		else {
			var response = {"parent" : categoryList[target]};
			console.log("Parent category: " + categoryList[target].parent); //For testing purposes only
  			res.json(response);
		}
	}

//  PHASE 2 CODE
//  NOTE: Because of queries, we can simplify the GET of subqueries all into 1 GET from #browse 
//  instead of having 2 GETs (one from GetSubQuery(id) and the other that occurs in #browse)
/*  else {
		var client = new pg.Client(dbConnInfo);
		client.connect();

		var query = client.query("SELECT cparent as id, cname as name from categories where cid = $1", [id]);
		
		query.on("row", function (row, result) {
	    	result.addRow(row);
		});
		query.on("end", function (result) {
			if (result.rowCount == 0){
				res.statusCode = 404;
				res.send("Category not found.");			
			}
			else {
				var response = {"parent" : result.rows};
				console.log("row count: " + result.rowCount);
				console.log("Parent category: " + categoryList[target].parent); //For testing purposes only
				client.end();
		  		res.json(response);
	  		}
	 	});
	}*/
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
		console.log("GET product: " + id);
	if ((id < 0) || (id >= productNextId)){
		// not found
		res.statusCode = 404;
		res.send("Product not found.");
	}
//	PHASE 1 CODE
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
			var response = {"product" : productList[target]};
  			res.json(response);	
  		}	
	}
//	PHASE 2 CODE

/*    else {
		var client = new pg.Client(dbConnInfo);
		client.connect();
		
		// Missing natural join with Auction table so it can query the current Bid price, 
		// and a natural join with categories will yield the parent category name
		var query = client.query("SELECT pid as id, pname as name, pimage_filename as image, pinstant_price as instant_price, pbrand as brand, pmodel as model, pdescription as description, pdimensions as dimensions from products where id = $1", [id]);
		
		query.on("row", function (row, result) {
	    	result.addRow(row);
		});
		query.on("end", function (result) {
			if (result.rowCount == 0){
				res.statusCode = 404;
				res.send("Product not found.");
			}
			else {
				var response = {"product" : result.rows};
				console.log("row count: " + result.rowCount);
				client.end();
		  		res.json(response);
		  	}
	 	});
    }*/
});

// REST Operation - HTTP POST to add a new product
app.post('/Server-Master/product/:sellerId', function(req, res) {
	console.log("POST");

  	if(!req.body.hasOwnProperty('name')||!req.body.hasOwnProperty('parent')||!req.body.hasOwnProperty('instantPrice')
			||!req.body.hasOwnProperty('bidPrice')||!req.body.hasOwnProperty('description')||!req.body.hasOwnProperty('model')
			||!req.body.hasOwnProperty('brand')||!req.body.hasOwnProperty('dimensions')){
				
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for product.');
  	}

  	var newProduct = new Product(req.body.name,req.body.parent,sellerId,
  								 req.body.instantPrice,req.body.bidPrice,req.body.description,
  								 req.body.model,req.body.brand,req.body.dimensions,0);
  								 
  	console.log("New Product: " + JSON.stringify(newProduct));
  	newProduct.id = productNextId++;
  	productList.push(newProduct);
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
	console.log("GET bid history for product id " + id);
	var bidHistory = new Array();

	if ((id < 0) || (id >= productNextId)){
		// not found
		res.statusCode = 404;
		res.send("Product not found.");
	}
	else {
		var target = -1;
		for (var i=0; i < productBidsList.length; ++i){
			if (productBidsList[i].productId == id){
				target = i;
				bidHistory.push(productBidsList[i]);
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("Product not found.");
		}
		else {
			var response = {"bidHistory" : bidHistory};
  			res.json(response);	
  		}	
	}
});

//JUAN SEARCH TESTING
// REST Operation - HTTP GET to read a product based on its id
app.get('/Server-Master/search', function(req, res) {
	console.log("GET products");

//  PHASE 1 CODE
/*	var response = {"ListOfProducts" : productList};
  	res.json(response);*/

//  PHASE 2 CODE
  	var client = new pg.Client(dbConnInfo);
	client.connect();

	// Missing natural join with Auction table so it can query the current Bid price
	query = client.query("SELECT pid as id, pname as name, pinstant_price as instant_price, pimage_filename as image from products");
	
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

// REST Operation - HTTP GET to read an address based on its id
app.get('/Server-Master/account/address/:id', function(req, res) {
	var id = req.params.id;
		console.log("GET shipAddress: " + id);
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
			var response = {"address" : shipAddressList[target]};
  			res.json(response);	
  		}	
	}
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

// REST Operation - HTTP GET to read a payment based on its id
app.get('/Server-Master/account/payment/:id', function(req, res) {
	var id = req.params.id;
		console.log("GET payment: " + id);
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
			var response = {"payment" : payTypeList[target]};
  			res.json(response);	
  		}	
	}
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
	var exists = false;
	//new-firstname, new-lastname, new-email, new-password, new-confirmpassword
  	if( !req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('firstname') ||
  		!req.body.hasOwnProperty('lastname') || !req.body.hasOwnProperty('email') ||
  		!req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('confirmpassword')){
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for new user.');
  	}
	for (var i=0; i < userList.length; ++i){
		if (userList[i].username == req.body.username){
			exists = true;
			break;
		}
	}
  	if (exists) {
  		res.statusCode = 409; // is this the correct code for when username already exists?
  		return res.send('Error: A user by this username already exists.');
  	}
  	else {
	  	var newUser = new User("user", req.body.username, req.body.password, req.body.firstname, 
	  		req.body.lastname, req.body.email);
	  	console.log("New User: " + JSON.stringify(newUser));
	  	newUser.id = userNextId++;
	  	userList.push(newUser);
	  	res.json(true);
  	}
});

// REST Operation - HTTP POST to login user
app.post('/Server-Master/home/:userNameLogin', function(req, res) {
	console.log("POST login attempt: " + req.params.userNameLogin);

  	if(!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password') ) {
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for user login.');
  	}
  	else {
  		var userName = req.body.username;
  		var passWord = req.body.password;
  		var target = -1; 
  		var found = false;
  		for (var i=0; i < userList.length;++i){
  			if(userList[i].username == userName){
  				found = true;
  			}
			if(userList[i].username == userName && userList[i].password == passWord){	
				target = i;
				console.log("Succesful login of user id: " + userList[i].id + " of type: " + userList[i].type);
				break;  	
			}
		}
		if (found && target == -1){
			res.statusCode = 409;
			res.send("Username exists but entered password does not match");
		}
		else if (found == false && target == -1){
			res.statusCode = 404;
			res.send("User not found.");
		}
		else {
			//Future work: create global userCount variable and add userCount++ here to see how many users are currently logged in
			var response = {"user" : userList[target]};
			res.json(response);	
		}	 	
	}
});

// REST Operation - HTTP GET to read a admin account based on its id
app.get('/Server-Master/admin/:id', function(req, res){
	var id = req.params.id;
	console.log("GET admin account: " + id);

	var response = {"categoryList": categoryList, "userList" : userList}
	res.json(response);

//  PHASE 2 CODE 
//  This was left to be used in PHASE 2 since you only had to regurn static data for PHASE 1
//  This code requires modifications to work with DB queries
/*	var shippingAddresses = new Array();
	var paymentTypes = new Array();
	var ratersList = new Array();
	var productsSale = new Array();

	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("Admin not found.");
	}
	else {
		var maxLength = Math.max(shipAddressList.length, payTypeList.length, ratingsList.length, productList.length); 
		var target = -1;
		for (var i=0; i < userList.length; ++i){
			//if user is found,
			if (userList[i].id == id){
				target = i;
				for(var x=0; x < maxLength; ++x){
					//return his shipping addresses
					if(x < shipAddressList.length && userList[i].id == shipAddressList[x].userId){
						shippingAddresses.push(shipAddressList[x]);
					}
					//return his payment types
					if(x < payTypeList.length && userList[i].id == payTypeList[x].userId){
						paymentTypes.push(payTypeList[x]);
					}
					//return his ratings
					if(x < ratingsList.length && userList[i].id == ratingsList[x].sellerId){
						ratersList.push(ratingsList[x]);
					}
					//return his products on sale
					if(x < productList.length && userList[i].id == productList[x].sellerId){
						productsSale.push(productList[x]);
					}
				}
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("User not found.");
		}
		else {
			var response = {"user" : userList[target], "shippingAddresses" : shippingAddresses, "paymentTypes" : paymentTypes, 
							"ratingsList" : ratersList, "sellingProducts" : productsSale};
  			res.json(response);	
  		}	
	}
*/
});

// REST Operation - HTTP GET to read report based on reportType
app.get('/Server-Master/admin/:id/report/:reportType', function(req, res){
	var reportType = req.params.reportType;
	console.log("GET report " + reportType);
	var response = {};
	if(reportType == "byProduct"){
		response = {"report" : productList};
	}
	else if (reportType == "all Products") {
		response = {"report" : productList};
	}
	else {
		response = {"report" : productList};
	}
	res.json(response);
});

// REST Operation - HTTP GET to read a seller profile based on its id
app.get('/Server-Master/seller/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET seller: " + id);

	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("Seller not found.");
	}
	else {
		var seller = {};
		var ratersList = new Array();
		var sellingProducts = new Array();
		var target = -1;
		for (var i=0; i < userList.length; ++i){
			//if user is found,
			if (userList[i].id == id){
				target = i;
				var maxLength = Math.max(ratingsList.length, productList.length); 
				
				for(var x=0; x < maxLength; ++x){
					//return his ratings
					if(x < ratingsList.length && userList[i].id == ratingsList[x].sellerId){
						ratersList.push(ratingsList[x]);
					}
					//return his products on sale
					if(x < productList.length && userList[i].id == productList[x].sellerId){
						sellingProducts.push(productList[x]);
					}
				}
				var seller = {"username" : userList[i].username, "email" : userList[i].email, "description" : "Hi im a good seller"};
				break;
			}
		}
		var response = {"sellerDetails": seller, "ratings" : ratersList, "sellingProducts" : sellingProducts};
		res.json(response);
	}
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
	console.log("GET user account: " + id);

	var shippingAddresses = new Array();
	var paymentTypes = new Array();
	var ratersList = new Array();
	var productsSale = new Array();

	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("User not found.");
	}
	else {
		var maxLength = Math.max(shipAddressList.length, payTypeList.length, ratingsList.length, productList.length); 
		var target = -1;
		for (var i=0; i < userList.length; ++i){
			//if user is found,
			if (userList[i].id == id){
				target = i;
				for(var x=0; x < maxLength; ++x){
					//return his shipping addresses
					if(x < shipAddressList.length && userList[i].id == shipAddressList[x].userId){
						shippingAddresses.push(shipAddressList[x]);
					}
					//return his payment types
					if(x < payTypeList.length && userList[i].id == payTypeList[x].userId){
						paymentTypes.push(payTypeList[x]);
					}
					//return his ratings
					if(x < ratingsList.length && userList[i].id == ratingsList[x].sellerId){
						ratersList.push(ratingsList[x]);
					}
					//return his products on sale
					if(x < productList.length && userList[i].id == productList[x].sellerId){
						productsSale.push(productList[x]);
					}
				}
				break;	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("User not found.");
		}
		else {
			var response = {"user" : userList[target], "shippingAddresses" : shippingAddresses, "paymentTypes" : paymentTypes, 
							"ratingsList" : ratersList, "sellingProducts" : productsSale};
  			res.json(response);	
  		}	
	}
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

// Server starts running when listen is called.
app.use(express.static(__dirname + '/RJN-Master'));
app.listen(process.env.PORT || 3412);
console.log("server listening");

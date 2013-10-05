// Express is the web framework 
var express = require('express');
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
// Modify this so it only gets the categories whose parent == null, and it can be used in conjunction with the browse (children) page.
// Then this get will be used for the actual home page
app.get('/Server-Master/home', function(req, res) {
	console.log("GET categories");

	var response = {"categories" : categoryList};
  	res.json(response);
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
app.get('/Server-Master/home/categories/:id', function(req, res) {
	var id = req.params.id; 
	console.log("GET subcategories of " + id);

	if ((id < 0) || (id >= categoryNextId)){
		// not found
		res.statusCode = 404;
		res.send("Category not found.");
	}
	else {
		var theChildren = new Array();
		var target = -1;
		var theType = true; //content of theChildren are subcategories
		for (var i=0; i < categoryList.length; ++i){
			if (categoryList[i].id == id){
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
				for (var i=0; i < productList.length; ++i){
					if (productList[i].parent == id){
						theChildren.push(productList[i]);
					}
				}		
			}
			var response = {"children" : theChildren, "parent" : categoryList[target], "childType" : theType};
			//console.log("History is: " + urlHistory);
			res.json(response);
		}
	}
});

// REST Operation - HTTP GET to get category's children
app.get('/Server-Master/subCategory/:id', function(req, res) {
	var id = req.params.id;
	console.log("GET subCategory: " + id);
	
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
			console.log(categoryList[target].parent);
  			res.json(response);
		}
	}
});

/*==================================================================*/
/*								Products							*/
/*==================================================================*/

var Product = modules.Product;

//Product:function(name,parent,sellerId,instantPrice,bidPrice,description,model,brand,dimensions)
var productList = new Array(
	new Product("MyPhone", 13, 0, 500, 400, "Brand new, still in box Myphone.", "MyPhone5X", "Mapple", '10"x8"x0.5"'),
	new Product("Viperus", 38, 0, 901, 700, "Honyota Viperus Wheels. Its so fast your skin flies off.", "Viperus XLR", "Honyota", '15" diameter with 2" thickness'),
	new Product("Test Product 1", 41, 1, 9001, 42, "Test of product printing", "model", "brand", "dimensions")
	);

var productNextId = 0;

for (var i=0; i < productList.length;++i){
	productList[i].id = productNextId++;
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
});

//JUAN SEARCH TESTING
// REST Operation - HTTP GET to read a product based on its id
app.get('/Server-Master/search', function(req, res) {
	console.log("GET products");

	var response = {"ListOfProducts" : productList};
  	res.json(response);
});
//JUAN SEARCH TESTING END
// Missing REST operations for posting, updating, and deleting a product.

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

var PaymentType = modules.PaymentType;

//user id, card info
var payTypeList = new Array(
	new PaymentType("0", "0123-4567-89AB-CDEF"),
	new PaymentType("0", "FEDC-BA98-7654-3210")
	);

var paymentNextId = 0;

for (var i=0; i < payTypeList.length;++i){
	payTypeList[i].id = paymentNextId++;
}

var Rating = modules.Rating;

//id, seller id, rater id, rating
var ratingsList = new Array(
	new Rating (0, 1, 4),
	new Rating (0, 2, 0)
	);

var ratingsNextId = 0;

for (var i=0; i < ratingsList.length;++i){
	ratingsList[i].id = ratingsNextId++;
}

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
			rese.send("Username exists but entered password does not match");
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

// REST Operation - HTTP GET to read a user account based on its id
app.get('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
		console.log("GET user account: " + id);
	var paymentTypes = new Array();
	var ratersList = new Array();
	var productsSale = new Array();
	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("User not found.");
	}
	else {
		var maxLength = Math.max(payTypeList.length, ratingsList.length, productList.length); 
		var target = -1;
		for (var i=0; i < userList.length; ++i){
			//if user is found,
			if (userList[i].id == id){
				target = i;
				for(var x=0; x < maxLength; ++x){
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
			var response = {"user" : userList[target], "paymentTypes" : paymentTypes, "ratingsList" : ratersList, "sellingProducts" : productsSale};
  			res.json(response);	
  		}	
	}
});

// REST Operation - HTTP POST to add a new a user
app.post('/Server-Master/register', function(req, res) {
	console.log("POST new user");
	var exists = false;
	//new-firstname, new-lastname, new-email, new-password, new-confirmpassword
  	if( !req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('firstname') ||
  		!req.body.hasOwnProperty('lastname') || !req.body.hasOwnProperty('email') ||
  		!req.body.hasOwnProperty('password') || !req.body.hasOwnProperty('confirmpassword') ||
  		!req.body.hasOwnProperty('shipaddress') || !req.body.hasOwnProperty('billaddress')){
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
	  		req.body.lastname, req.body.email, req.body.shipaddress, req.body.billaddress);
	  	console.log("New User: " + JSON.stringify(newUser));
	  	newUser.id = userNextId++;
	  	userList.push(newUser);
	  	res.json(true);
  	}
});
// REST Operation - HTTP PUT to updated an account based on its id
/*app.put('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
		console.log("PUT user account: " + id);

	if ((id < 0) || (id >= userNextId)){
		// not found
		res.statusCode = 404;
		res.send("User not found.");
	}
	else if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('type')){
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
			theUser.name = req.body.name;
			theUser.type = req.body.type;

			var response = {"user" : theUser};
  			res.json(response);		
  		}
	}
});*/

// Missing REST Operation for deleting user


// Server starts running when listen is called.
app.use(express.static(__dirname + '/RJN-Master'));
app.listen(process.env.PORT || 3412);
console.log("server listening");

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
/*==================================================================*/
var Category = modules.Category;
var categoryList = modules.categoryList;

var categoryList = new Array(
	new Category(0, "Books", null),
	new Category(1, "Electronics", null),
	new Category(2, "Computers", null),
	new Category(3, "Clothing", null),
	new Category(4, "Shoes", null),
	new Category(5, "Sports", null)
	);

var subCategoryList = new Array(
	new Category(6, "Children", "books"),
	new Category("Fiction", "books"),
	new Category("Technology", "books"),
	new Category("Business","books"),

	new Category("TV", "electronics"),
	new Category("Audio", "electronics"),
	new Category("Phones", "electronics"),
	new Category("Cameras", "electronics"),
	new Category("Video", "electronics"),

	new Category("Laptops", "computers"),
	new Category("Desktops", "computers"),
	new Category("Tablets", "computers"),
	new Category("Printers", "computers"),
	
	new Category("Children","clothing"),
	new Category("Men", "clothing"),
	new Category("Women", "clothing"),

	new Category("Children", "shoes"),
	new Category("Men", "shoes"),
	new Category("Women", "shoes"),

	new Category("Bicycles" "sports"),
	new Category("Fishing", "sports"),
	new Category("Baseball", "sports"),
	new Category("Gulf", "sports"),
	new Category("Basketball", "sports")

var menClothingCategoryList = new Array(
	new Category("Shirts", "menClothing"),
	new Category("Pants", ""),
	new Category("Socks")
	);

var womenClothingCategoryList = new Array(
	new Category("Shirts"),
	new Category("Pants"),
	new Category("Dresses")
	);

var bicyclesSportsCategoryList = new Array(
	new Category("Frames"),
	new Category("Wheels"),
	new Category("Helmet"),
	new Category("Parts")
	);

var categoryNextId = 0; //ponle el id de la subcategory "Parts"

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
app.get('/Server-Master/home', function(req, res) {
	console.log("GET");

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
	else if(!req.body.hasOwnProperty('name')){/* || !req.body.hasOwnProperty('model')
  	|| !req.body.hasOwnProperty('year') || !req.body.hasOwnProperty('price') || !req.body.hasOwnProperty('description')) {*/
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
			/*theCategory.model = req.body.model;
			theCategory.year = req.body.year;
			theCategory.price = req.body.price;
			theCategory.description = req.body.description;*/
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

  	if(!req.body.hasOwnProperty('name') ){/*|| !req.body.hasOwnProperty('model')
  	|| !req.body.hasOwnProperty('year') || !req.body.hasOwnProperty('price') || !req.body.hasOwnProperty('description')) {*/
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for category.');
  	}

  	var newCategory = new Category(req.body.name);/*, req.body.model, req.body.year, req.body.description, req.body.price);*/
  	console.log("New Category: " + JSON.stringify(newCategory));
  	newCategory.id = categoryNextId++;
  	categoryList.push(newCategory);
  	res.json(true);
});

/*==================================================================*/
/*								Users								*/
/*==================================================================*/
var User = modules.User;

//name, type, username, password, description
var userList = new Array(
	new User("Gustavo", "user", "heoro", "serrano", "Qui a coupe le fromage?"),
	new User("Nelson", "user", "nelsongo", "reyes", "Stuff and things."),
	new User("Juan", "admin", "kylar", "7", "Karate Chop!")
	);

var userNextId = 0;

for (var i=0; i < userList.length;++i){
	userList[i].id = userNextId++;
}

// REST Operation - HTTP GET to read a user account based on its id
app.get('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
		console.log("GET user account: " + id);
	var response = {};
	if (id == -1){
		response = {"user" : {"id" : "-1", "type": "foobar", "username" : "Sign In"}};
		res.json(response);
	}
	else if ((id < 0) || (id >= userNextId)){
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
			response = {"user" : userList[target]};
  			res.json(response);	
  		}	
	}
});

// REST Operation - HTTP POST to login user
app.post('/Server-Master/home/:userNameLogin', function(req, res) {
	console.log("POST user login: " + req.params.userNameLogin);

  	if(!req.body.hasOwnProperty('username') || !req.body.hasOwnProperty('password') ) {/*
  	|| !req.body.hasOwnProperty('year') || !req.body.hasOwnProperty('price') || !req.body.hasOwnProperty('description')) {*/
    	res.statusCode = 400;
    	return res.send('Error: Missing fields for user login.');
  	}
  	else {
  		var userName = req.body.username;
  		var passWord = req.body.password;
  		var target = -1; 
  		for (var i=0; i < userList.length;++i){
			if(userList[i].username == userName && userList[i].password == passWord){	
				target = i;
				console.log("Succesful login of user id: " + userList[i].id + " of type: " + userList[i].type);
				break;  	
			}
		}
		if (target == -1){
			res.statusCode = 404;
			res.send("User not found.");
		}
		else {
			//create global userCount variable and add userCount++ here to see how many users are currently logged in
			var response = {"user" : userList[target]};
  			res.json(response);	
  		}	 	
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

/*==================================================================*/
/*								Products							*/
/*==================================================================*/

var Product = modules.Product;

//name,instantPrice,bidPrice,description,model,brand,dimensions
var productList = new Array(
	new Product("MyPhone", 500, 400, "Brand new, still in box Myphone.", "MyPhone5X", "Mapple", '10"x8"x0.5"'),
	new Product("Viperus", 9001, 7000, "1969 Honyota Viperus. Its so fast your skin flies off.", "Viperus XLR", "Honyota", "20feetx6feetx5feet")
	);

var productNextId = 0;

for (var i=0; i < productList.length;++i){
	productList[i].id = "p"+productNextId++;
}

// REST Operation - HTTP GET to get subcategories
app.get('/Server-Master/home/:urlhistory', function(req, res) {

	var urlhistory = req.params.urlhistory;

	console.log("GET categoryId: " + productId);

	if ((productId < 0) || (id >= productNextId)){
		// not found
		res.statusCode = 404;
		res.send("Product not found.");
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
			res.send("Product not found.");
		}
		else {
			var response = {"subCategory" : List[target]};
  			res.json(response);	
  		}	
	}
});

// Server starts running when listen is called.
app.listen(process.env.PORT || 3412);
console.log("server listening");

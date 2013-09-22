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
var Category = modules.Category;
var User = modules.User;

var categoryList = new Array(
	new Category("Books"),
	new Category("Electronics"),
	new Category("Computers"),
	new Category("Clothing"),
	new Category("Shoes"),
	new Category("Sports")
	);
	/*new Category("Ford", "Escape", "2013", "V4 engine, 30mpg, Gray", "18000"),
	new Category("BMW", "323", "2013", "V6 engine, 22mpg, White", "35000"),
	new Category("Toyota", "Corolla", "2012", "V4 engine, 32mpg, Black", "16000"),
	new Category("Ford", "F-150", "2013", "V8 engine, 18mpg, Charcoal", "24000"),
	new Category("Nissan", "Pathfinder", "2012", "V6 engine, 20mpg, Pearl", "32000")	
);*/
 var categoryNextId = 0;
 

var userList = new Array(
	new User("Gustavo", "user", "heoro", "serrano", "Qui a coupe le fromage?"),
	new User("Nelson", "user", "nelsongo", "reyes", "Stuff and things.")
	);
 var userNextId = 0;
/*
var Admin = modules.Admin;
var adminList = new Array(
	new Admin("Rick", "admin");
	);
var adminNextId = 0;*/

for (var i=0; i < userList.length;++i){
	userList[i].id = userNextId++;
}

for (var i=0; i < categoryList.length;++i){
	categoryList[i].id = categoryNextId++;
}
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
	var response = {"categories" : categoryList, "userBtnName" : req.body.name};
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

// REST Operation - HTTP GET to read a user account based on its id
app.get('/Server-Master/account/:id', function(req, res) {
	var id = req.params.id;
		console.log("GET user account: " + id);

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
			var response = {"user" : userList[target]};
  			res.json(response);	
  		}	
	}
});

// REST Operation - HTTP PUT to updated an account based on its id
app.put('/Server-Master/account/:id', function(req, res) {
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

// REST Operation - HTTP POST to login user


// Server starts running when listen is called.
app.listen(process.env.PORT || 3412);
console.log("server listening");

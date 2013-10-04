
////////////////////////////////////////////////////////////////////////////////////////////////////////
//								CATEGORY LIST A.K.A. HOME PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#categories", function( event, ui ) {
	currentHistory = "";
	$.ajax({
		url : "http://localhost:3412/Server-Master/home",
		contentType: "application/json",
		success : function(data, textStatus, jqXHR){
			var categoryList = data.categories;
			//$("#userBtn").html(currentUser.username);

			var len = categoryList.length;
			var list = $("#category-list");
			list.empty();
			var category;
			for (var i=0; i < len; ++i){
				category = categoryList[i];

				//when home, print parent==null
				if(!category.parent) {	
					list.append("<li><a onclick=GetSubCategory("+category.id+")><h2>"+category.name+"</h2></a>"+
					"<a onclick=editCategory("+category.id+") data-icon='gear' >Edit</a></li>");
				}
			
	
					/*
					 * DON'T DELETE
					 ("<li><a onclick=GetCategory(" + category.id + ")>" + 
					"<h2>" + category.name + " " + category.model +  "</h2>" + 
					"<p><strong> Year: " + category.year + "</strong></p>" + 
					"<p>" + category.description + "</p>" +
					"<p class=\"ui-li-aside\">" + accounting.formatMoney(category.price) + "</p>" +
					"</a></li>");*/
				
			}
			list.listview("refresh");	
		},
		error: function(data, textStatus, jqXHR){
			
			console.log("textStatus: " + textStatus);
			alert("Data not found!");
		}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										SUB-CATEGORY LIST											  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#browse", function( event, ui ) {
	//currentHistory will be used later to display breadcrumb trail on page as you go deeper into the category hierarchy
	//currentHistory = currentHistory + "/" + currentCategory.id;
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/categories/" + currentCategory.id,
		method: 'get',
		//method: 'post',
		//data : JSON.stringify({"urlhistory": currentHistory}),
		contentType: "application/json",
		//dataType:"json",
		success : function(data, textStatus, jqXHR){
			$("#browseTitle").html(data.parent.name);
			var childrenList = data.children;
			var len = childrenList.length;
			var list = $("#browse-list");
			list.empty();
			var child;
			//when childrenList contains sub-categories
			if(data.childType == true){
					for (var i=0; i < len; ++i){
					child = childrenList[i];		
					list.append("<li><a onclick=GetSubCategory("+child.id+")><h2>"+child.name+"</h2></a>"+
					'<a onclick=editCategory('+child.id+') data-icon="gear">Edit</a></li>');	
				}
			}
			//when childrenList contains products
			else{
				for (var i=0; i < len; ++i){
					child = childrenList[i];
					//<li><img src="http://3.bp.blogspot.com/-nU8O8xLuSvs/TdjWsU3X2DI/AAAAAAAAAIs/Lsa3Y92DGy0/s320/112.jpg" /></li>	
					list.append('<li><a onclick=GetProduct('+child.id+')><h2>'+child.name+'</h2>'+
					'<p><img src="http://3.bp.blogspot.com/-nU8O8xLuSvs/TdjWsU3X2DI/AAAAAAAAAIs/Lsa3Y92DGy0/s320/112.jpg" /></p>'+
					'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(child.bidPrice) + '</h4></p>'+
					'<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(child.instantPrice) + '</h4></p></a>'+
					'<a onclick=editProduct('+child.id+') data-icon="gear" Edit</a></li>');	
					//Juan Test =====================================================================================================
					list.append('<li><a onclick=GetProduct('+child.id+')><h2>'+child.name+'</h2>'+
					'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(child.bidPrice) + '</h4></p>'+
					'<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(child.instantPrice) + '</h4></p></a>'+
					'<a onclick=editProduct('+child.id+') data-icon="gear" Edit</a></li>');	
					list.append('<li><a onclick=GetProduct('+child.id+')><h2>'+child.name+'</h2>'+
					'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(child.bidPrice) + '</h4></p>'+
					'<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(child.instantPrice) + '</h4></p></a>'+
					'<a onclick=editProduct('+child.id+') data-icon="gear" Edit</a></li>');	
					//Juan Test End =================================================================================================
				}
			}
			list.listview("refresh");	
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			alert("Data not found!");
		}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										CATEGORY DETAILS											  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#category-view", function( event, ui ) {
	// currentCategory has been set at this point
	$("#upd-name").val(currentCategory.name);
	/*
	 * DON'T DELETE
	$("#upd-model").val(currentCategory.model);
	$("#upd-year").val(currentCategory.year);
	$("#upd-price").val(currentCategory.price);
	$("#upd-description").val(currentCategory.description);
	*/
});

//--------------- Enter Button Fix - Juan ---------------//
$(document).ready(function(){
    $("#upd-name").keypress(function(e){
      if(e.keyCode==13)
      $("#SaveNewInfo").click();
    });
});
	
$(document).ready(function(){
    $("#name").keypress(function(e){
      if(e.keyCode==13)
      $("#SaveNewCategory").click();
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
//										USER ACCOUNT												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#user-account", function( event, ui ) {
	// currentUser has been set at this point
	var user = currentUser;
	$("#userTitle").html(user.username);

	//Populate user information list
	var infoList = $("#user-info");
	infoList.empty();
	infoList.append("<li><h2>" + user.username + "</h2></li><li><strong>Account ID: </strong>" + user.id + '</li></li>'+
		'<li><strong>First Name: </strong>' + user.firstname + '</li></li><li><strong>Last Name: </strong>' + user.lastname + 
		'</li></li><li><strong>Email: </strong>' + user.email + '</li><li><strong>Shipping Address: </strong>' + user.shipAddress+'</li>'+
		'<li><strong>Billing Address: </strong>' + user.billAddress + '</li>'
	);
	infoList.listview("refresh");

	//Populate payment information list
	var payTypes = currentPaymentTypes;
	var payList = $("#paymentType-list");
	payList.empty();
	//alert(JSON.stringify(payTypes));
	//This is not fully functional yet because payTypes contains the right number of elements, but they each have empty values that should not be there
	for(var i=0; i < payTypes.length; ++i){
		//payList.append('<li>Card Ending with '+ payTypes[i].cNumber.substr(16)+'</li>');
	}
	payList.listview("refresh");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										ACCOUNT	DETAILS												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#update-account", function(event, ui){
	$("#acc-fname").val(currentUser.firstname);
	$("#acc-lname").val(currentUser.lastname);
	$("#acc-email").val(currentUser.email);
	$("#acc-sAddress").val(currentUser.shipAddress);
	$("#acc-bAddress").val(currentUser.billAddress);
	//not finished - missing the logic for changing password
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										PRODUCT	DETAILS												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#product-view", function( event, ui ) {
	// currentProduct has been set at this point
	var product = currentProduct;
	$("#productTitle").html(product.name);
	$("#showBidPrice").html(product.bidPrice);
	$("#showBuyoutPrice").html(product.instantPrice);
	var list = $("#prod-details");
	list.empty();
	list.append('<li><img src="http://3.bp.blogspot.com/-nU8O8xLuSvs/TdjWsU3X2DI/AAAAAAAAAIs/Lsa3Y92DGy0/s320/112.jpg" /></li>'+
	'<li><strong>Product ID: </strong>' + product.id + '</li></li><li><strong>Brand: </strong>' + product.brand + '</li></li>'+
	'<li><strong>Model: </strong>' + product.model + '</li></li><li><strong>Description: </strong>' + product.description + '</li>'+
	'<li><strong>Dimensions: </strong>'+product.dimensions+'</li>');
	list.listview("refresh");	
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											BUTTON FUNCTION:										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

function ConverToJSON(formData){
	var result = {};
	$.each(formData, 
		function(i, o){
			result[o.name] = o.value;
	});
	return result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE CATEGORIES											  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentCategory = {}; //-- ??
var currentHistory = ""; //-- ??

//--------------- POST NEW CATEGORY (ADMIN ONLY) ---------------//
function SaveCategory(){
	$.mobile.loading("show");
	var form = $("#category-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var newCategory = ConverToJSON(formData);
	console.log("New Category: " + JSON.stringify(newCategory));
	var newCategoryJSON = JSON.stringify(newCategory);
	$.ajax({
		url : "http://localhost:3412/Server-Master/home",
		method: 'post',
		data : newCategoryJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#categories");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			alert("Data could not be added!");
		}
	});

}

//--------------- GET CATEGORY DETAILS (ADMIN ONLY) ---------------//
function editCategory(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			currentCategory = data.category;
			$.mobile.loading("hide");
			$.mobile.navigate("#category-view");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Category not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
}

//--------------- GET SUB-CATEGORY (gets categories that are children of main categories or of other categories)---------------//
function GetSubCategory(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/subCategory/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			currentCategory = data.parent;
			$.mobile.loading("hide");
			$.mobile.navigate("#browse");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Category not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
}

//--------------- PUT NEW CATEGORY DETAILS (ADMIN ONLY) ---------------//
function UpdateCategory(){
	$.mobile.loading("show");
	var form = $("#category-view-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var updCategory = ConverToJSON(formData);
	updCategory.id = currentCategory.id;
	console.log("Updated Category: " + JSON.stringify(updCategory));
	var updCategoryJSON = JSON.stringify(updCategory);
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/" + updCategory.id,
		method: 'put',
		data : updCategoryJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#categories");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Data could not be updated!");
			}
			else {
				alert("Internal Error.");		
			}
		}
	});
}

//--------------- DELETE CURRENT CATEGORY (ADMIN ONLY) ---------------//
function DeleteCategory(){
	$.mobile.loading("show");
	var id = currentCategory.id;
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/" + id,
		method: 'delete',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#categories");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Category not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE USERS											      //
////////////////////////////////////////////////////////////////////////////////////////////////////////

//initial value is set to null for when noone is logged in
var currentUser = {"id": null}; //-- ??
var currentPaymentTypes = {}; //-- ??

//--------------- Logs in via POST so it can send the form values of username and password to the server for authentication ---------------//
function LogIn(){
	$.mobile.loading("show");
	var form = $("#login-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var userLogin = ConverToJSON(formData);
	console.log("User Login: " + JSON.stringify(userLogin));
	var userLoginJSON = JSON.stringify(userLogin);
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/" + userLogin.username,
		method: 'post',
		data : userLoginJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			currentUser = data.user;
			$.mobile.navigate("#categories");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			alert("Username and password match could not be found. Please try again!");
		}
	});
}

//--------------- GET USER ACCOUNT + PRIVILEGES(in the future). If user is user it loads user account; if admin, loads admin controls page ---------------//
function GetUserAccount(){
	$.mobile.loading("show");
	if(currentUser.id == null){
		$.mobile.navigate("#login");
	}
	else{
		$.ajax({
			url : "http://localhost:3412/Server-Master/account/" + currentUser.id,
			method: 'get',
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				currentUser = data.user;
				currentPaymentTypes = data.paymentTypes;
				$.mobile.loading("hide");
				if(currentUser.type == "user"){
					$.mobile.navigate("#user-account");
				}
				else if(currentUser.type == "admin"){
					$.mobile.navigate("#admin-account");
				}
				else {
					$.mobile.navigate("#login");
				}
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if (data.status == 404){
					alert("User not found.");
				}
				else {
					alert("Internal Server Error.");
				}
			}
		});
	}
}

//--------------- REGISTER NEW USER ACCOUNT - Checks if passwords do not match before sending information, and cheks if username is already taken ---------------//
function RegisterAccount(){
	if( $('#new-password').val() != $('#new-confirmpassword').val()){
		alert("Password fields do not match. Please type them again.");
	}
	else{
		$.mobile.loading("show");
		var form = $("#register-form");
		var formData = form.serializeArray();
		console.log("form Data: " + formData);
		var newUser = ConverToJSON(formData);
		console.log("New Category: " + JSON.stringify(newUser));
		var newUserJSON = JSON.stringify(newUser);
		$.ajax({
			url : "http://localhost:3412/Server-Master/register",
			method: 'post',
			data : newUserJSON,
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#login");
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if(data.status == 409){
					alert("A user by this username already exists. Please choose a different username");
				}
				else{
					alert("New user could not be registered!");
				}
			}
		});
	}
}

//NOT finished yet
/*function UpdateAccount(){
	$.mobile.loading("show");
	var form = $("#account-view-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var updCategory = ConverToJSON(formData);
	updCategory.id = currentCategory.id;
	console.log("Updated Category: " + JSON.stringify(updCategory));
	var updCategoryJSON = JSON.stringify(updCategory);
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/" + updCategory.id,
		method: 'put',
		data : updCategoryJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#categories");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Data could not be updated!");
			}
			else {
				alert("Internal Error.");		
			}
		}
	});
}*/

//--------------- LOG CURRENT USER ACCOUNT and resets global variables to their initial state---------------//
function LogOut(){
	var uExit = confirm("Do you want to log out?");
	if(uExit == true){
		$.mobile.loading("show");
		//global variables are reset to initial values.
		currentUser = {"id": null};
		currentPaymentTypes = {};
		Cart = []; //added this for Juan so his cart array gets emptied after logout
		$.mobile.loading("hide");
		$.mobile.navigate("#categories");
	}
	else{
		$.mobile.loading("hide");
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE PRODUCT												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentProduct = {}; //--??

//--------------- GET PRODUCT by id.  ---------------//
function GetProduct(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/product/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			currentProduct = data.product;
			$.mobile.loading("hide");
			$.mobile.navigate("#product-view");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Product not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE CART												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
var Cart=[];//Test - Juan - ARRAY OF CURRENT PRODUCTS IN CART
//--------------- GET CART + ADD PRODUCTS (NO NAVIGATION!!!) ---------------//
function addToCart(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/product/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			Cart.push(currentProduct);
			$.mobile.loading("hide");
			
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Product not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
}

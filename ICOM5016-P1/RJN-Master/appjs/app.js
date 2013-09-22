

$(document).on('pagebeforeshow', "#categories", function( event, ui ) {
	$.ajax({
		url : "http://localhost:3412/Server-Master/home",
		contentType: "application/json",
		success : function(data, textStatus, jqXHR){
			var categoryList = data.categories;
			var len = categoryList.length;
			var list = $("#category-list");
			list.empty();
			var category;
			for (var i=0; i < len; ++i){
				category = categoryList[i];
				list.append("<li><a onclick=GetCategory(" + category.id + ")>" +"<h2>" + category.name + "</h2>"+"</a></li>");
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

////////////////////////////////////////////////////////////////////////////////////////////////
/// Functions Called Directly from Buttons ///////////////////////

function ConverToJSON(formData){
	var result = {};
	$.each(formData, 
		function(i, o){
			result[o.name] = o.value;
	});
	return result;
}
// Rick Code

var currentUsers = {};
function GetUserAccount(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			//$.mobile.navigate("#user-account");
			currentUser = data.users;
			var len = currentUser.length;
			var list = $("#user-info");
			list.empty();
			var user = currentUser[0];
				list.append("<li><h2>" + user.name + "</h2>"+ "<p><strong> Account ID: " + user.id + "</strong></p>"+"</a></li>");
			list.listview("refresh");	
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
// End of Rick Code

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

var currentCategory = {};

function GetCategory(id){
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
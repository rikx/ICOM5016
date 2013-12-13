////////////////////////////////////////////////////////////////////////////////////////////////////////
//											HOME PAGE												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#home", function( event, ui ) {
	currentHistory = [];
	$.ajax({
		url : "http://localhost:3412/Server-Master/home",
		contentType: "application/json",
		success : function(data, textStatus, jqXHR){
			var categoryList = data.categories;
			$(".sort-type").html('');
			var len = categoryList.length;
			var list = $("#category-list");
			list.empty();
			var category;
			for (var i=0; i < len; ++i){
				category = categoryList[i];
				list.append("<li><a onclick=GetSubCategory("+category.id+")><h2>"+category.name+"</h2></a></li>");	
			}
			list.listview("refresh");
			SortType="none";	
		},
		error: function(data, textStatus, jqXHR){
			
			console.log("textStatus: " + textStatus);
			alert("Data not found!");
		}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										SHOPPING CART PAGE											  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var ShipAddressess = [];
var PayAddressess = [];

$(document).on('pagebeforeshow', "#cart", function( event, ui ) {
			//hides payment and address options
			if(currentUser.account_id == null || currentUser.permission == true){
				$('#cart-choose-options').hide();
			}
			else{
				$('#cart-choose-options').show();
			}
			var len = Cart.length;
			var list = $("#shopping-list");
			var cList = $("#total");
			var shipAddressList = $('#cart-shipaddress-list');
			var payList = $('#cart-paymentType-list');
			var total = 0.00;

			list.empty();
			cList.empty();
			payList.empty();
			shipAddressList.empty();
			
				for (var i=0; i < len; ++i){
					product = Cart[i];
					total=total+product.instant_price;
					list.append('<li><a onclick=GetProduct('+product.product_id+')><h2>'+product.name+'</h2></a>'+
					'<a onclick=removeFromCart('+i+') data-icon="delete">Delete</a></li>');
				}
				
			list.listview("refresh");	
			cList.append('<li><h2><strong> Total: ' + accounting.formatMoney(total) + '</strong></h2></li>');
			cList.listview("refresh");

	if(currentUser.account_id != null){
		$.ajax({
				url : "http://localhost:3412/Server-Master/account/" + currentUser.account_id,
				method: 'get',
				contentType: "application/json",
				dataType:"json",
				success : function(data, textStatus, jqXHR){
					
					var paymentTypes = data.paymentOptions;
					var shippingAddresses = data.shippingAddresses;
					
					var maxLength = Math.max(shippingAddresses.length, paymentTypes.length); 
		
					for(var i=0; i < maxLength; ++i){
						//Populate Address Options List
						if(i < shippingAddresses.length){
								
								var ShipAddress = " " + shippingAddresses[i].street_address + " " + shippingAddresses[i].city + " " +
								shippingAddresses[i].country + " " + shippingAddresses[i].state + " " + shippingAddresses[i].zipcode + " ";
								
								ShipAddressess[i] = ShipAddress;
								
								shipAddressList.append('<li><div><center><strong> Address:' + ShipAddress +'</strong></center></div></li>'+
								'<li><a onclick=InvoiceAddress('+ i +') data-theme="a" data-icon="check" href="#choose" data-rel="popup" data-position-to="window" data-transition="pop">SELECT</a></li>'
								);
						}
						//Populate Payment Options list
						if(i < paymentTypes.length){
							
								var PayAddress = " " + paymentTypes[i].street_address + " " + paymentTypes[i].city + " " +
								paymentTypes[i].country + " " + paymentTypes[i].state + " " + paymentTypes[i].zipcode + " ";
							
								PayAddressess[i] = PayAddress;
							
								payList.append('<li><div><center>Card Ending with '+ paymentTypes[i].card_number.substr(15)+'</center>'+
								'<center><strong>Billing Address: </strong>'+ PayAddress +'</center></div></li>'+
								'<li><a onclick=InvoicePayment('+ i +','+ paymentTypes[i].card_number.substr(15) +') data-theme="a" data-icon="check" href="#choose2" data-rel="popup" data-position-to="window" data-transition="pop">SELECT</a></li>'
								);
						}
					}
					
					shipAddressList.listview("refresh");
					payList.listview("refresh");
		
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
	}//End IF
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										INVOICE PAGE											 	 //
////////////////////////////////////////////////////////////////////////////////////////////////////////
var invoiceBillAddress=null;
var invoiceShipAddress=null;
var invoiceID=0;
$(document).on('pagebeforeshow', "#invoice", function( event, ui ) {
	
			
			var len = Cart.length;
			var shipping = $("#ShipTo");
			var billing = $("#BillTo");
			var list = $("#checkout-list");
			var total = 0.00;
			list.empty();
			billing.empty();
			shipping.empty();
			$("#invoiceID").html('Invoice ID: '+invoiceID++);
			
			billing.append('<li><div><center><h3><strong>'+currentUser.first_name+'  '+currentUser.last_name+'</strong></h3></center></div></li>'+
						   '<li><div><center><h3>'+invoiceBillAddress+'</h3></center></div></li>');
			
			shipping.append('<li><div><center><h3><strong>'+currentUser.first_name+'  '+currentUser.last_name+'</strong></h3></center></div></li>'+
						   '<li><div><center><h3>'+invoiceShipAddress+'</h3></center></div></li>');

				for (var i=0; i < len; ++i){
					product = Cart[i];
					total=total+product.instant_price;
					list.append('<li><div><h2><strong>'+product.name+' Item #:'+product.product_id+'</strong></h2>'+
								'<p><h3>'+product.description+'</h3></p>'+
								'<h3 align="right">'+accounting.formatMoney(product.instant_price)+'</h3></div></li>');
				}
			list.append('<li><h2><strong> Total: ' + accounting.formatMoney(total) + '</strong></h2></li>');
			
			list.listview("refresh");	
			billing.listview("refresh");
			shipping.listview("refresh");
			Cart = [];
			
			invoiceBillAddress=null;
			invoiceShipAddress=null;

});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										SUB-CATEGORY LIST PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var SortType="none";
var currentHistory = [];
$.mobile.changePage.defaults.allowSamePageTransition = true;
$.mobile.defaultPageTransition = 'none';
$.mobile.defaultDialogTransition = 'none';

$(document).on('pagebeforeshow', "#browse", function( event, ui ) {	
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/categories/" + currentCategory.id + "/"+SortType,
		method: 'get',
		contentType: "application/json",
		success : function(data, textStatus, jqXHR){
			//$("#browse-title").html(data.parent);
			$('#sorted-auctions-title, #sorted-sales-title, #browse-results-buttons').hide();
			var list = $("#browse-list");
			var auctions_ul = $("#sorted-auctions-list");
			var sales_ul = $("#sorted-sales-list");
			list.empty();
			auctions_ul.empty();
			sales_ul.empty();

			$(".sort-type").html('');
			
			//shows history breadcrumb
			$('#breadcrumb-history').html('');

			for (var i = 0; i < currentHistory.length; i++){
				//add reference to Home
				if(i==0){
					$('#breadcrumb-history').append('<a href="#home">Home</a> | ');
				}
				$('#breadcrumb-history').append('<a onclick=GetSubCategory('+currentHistory[i].id+')>'+currentHistory[i].name+'</a>');
				if(i!=currentHistory.length-1){
					$('#breadcrumb-history').append(' | ');
				}
			}
			//when data contains sub-categories
			if (data.type == true){
				var categoriesList = data.categories;
				var category;
				for (var i=0; i < categoriesList.length; ++i){
					category = categoriesList[i];		
					list.append("<li><a onclick=GetSubCategory("+category.id+")><h2>"+category.name+"</h2></a></li>");	
				}
			}
			//when data contains products
			else {
				// adds sort buttons and initilializes them
				$(".sort-type").html('<button onclick=sortByType("name") data-mini="true" data-theme="c">SortByName</button><button onclick=sortByType("brand") data-mini="true" data-theme="c">SortByBrand</button><button onclick=sortByType("price") data-mini="true" data-theme="c">SortByPrice</button>').trigger('create');
				$('#browse-results-buttons').show();
				var auction_list = data.auction_products;
				var on_sale_list = data.sale_products;
				var maxLength = Math.max(auction_list.length, on_sale_list.length);
				var auction_product, on_sale_product;
				
				// add select auction or products buttons
				// prints list element depending on product type
				for (var i=0; i < maxLength; ++i){
					if(i < auction_list.length){
						$('#sorted-auctions-title').show();
						auction_product = auction_list[i];
/*						list.append('<li><a onclick=GetProduct('+auction_product.product_id+')><h2>'+auction_product.name+'</h2>'+
						'<p><img class="img-size" src="'+auction_product.image_filename+'"" /></p>'+ 
						'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(auction_product.current_bid) + '</h4></p>');
						if(auction_product.instant_price > 0.00){
							list.append('<p class=\"ui-li-aside\"><h4>Buyout Price: ' + accounting.formatMoney(auction_product.instant_price) + '</h4></p></a></li>');
						}
						else {
							list.append('</a></li>');
						}	*/
						var string1 = '<li><a onclick=GetProduct('+auction_product.product_id+')><h2>'+auction_product.name+'</h2>'+
						'<p><img class="img-size" src="'+auction_product.image_filename+'"" /></p>'+ 
						'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(auction_product.current_bid) + '</h4></p>';
						if(auction_product.instant_price > 0.00){
							string1+='<p class=\"ui-li-aside\"><h4>Buyout Price: ' + accounting.formatMoney(auction_product.instant_price) + '</h4></p></a></li>';
						}
						else {
							string1+='</a></li>';
						}
						//$("#browse-list, #sorted-auction-list").append(string1);
						auctions_ul.append(string1);
					}
					if(i < on_sale_list.length){
						$('#sorted-sales-title').show();
						on_sale_product = on_sale_list[i];
						//$("#browse-list, #sorted-sales-list")
						sales_ul.append('<li><a onclick=GetProduct('+on_sale_product.product_id+')><h2>'+on_sale_product.name+'</h2>'+
						'<p><img class="img-size" src="'+on_sale_product.image_filename+'"" /></p>'+ 
						'<p class=\"ui-li-aside\"><h4>Price: ' + accounting.formatMoney(on_sale_product.instant_price) + '</h4></p>'+
						'<p class=\"ui-li-aside\"><h4>Quantity: ' + on_sale_product.quantity + '</h4></p></a></li>');	
					}
				}
			}
			list.listview("refresh");
			auctions_ul.listview("refresh");
			sales_ul.listview("refresh");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			alert("No products found.");
		}
	});

	SortType="none";
	
});

function showAuctions(){
	$('#sorted-sales-title, #sorted-sales-list, #browse-list').hide();
	$('#sorted-auctions-title, #sorted-auctions-list').show();
};
function showSales(){
	$('#sorted-auctions-title, #sorted-auctions-list, #browse-list').hide();
	$('#sorted-sales-title, #sorted-sales-list').show();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////
//										CATEGORY DETAILS PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#category-view", function( event, ui ) {
	// currentCategory has been set at this point
	$("#edit_cname").val(currentCategory.cname);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										   	ADD PRODUCT PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#add-product", function( event, ui ) {
	$.ajax({
				url : "http://localhost:3412/Server-Master/categories/all",
				method: 'get',
				contentType: "application/json",
				dataType:"json",
				success : function(data, textStatus, jqXHR){
					var categories_all = data.categories;
					var categories_select = $("#product-parent-category");
					for (var i = 0; i < categories_all.length; i++){
						if(categories_all[i].parent == null) {
							categories_select.append("<option value='"+categories_all[i].id+"'>"+categories_all[i].name+"</option>");
						}
						else {
							categories_select.append("<option value='"+categories_all[i].id+"'>"+categories_all[i].parent+" - "+categories_all[i].name+"</option>");
						}
					}
				},
				error: function(data, textStatus, jqXHR){
					console.log("textStatus: " + textStatus);
					alert("No categories found.");
				}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										   	ADD PRODUCT PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#add-category", function( event, ui ) {
	$.ajax({
				url : "http://localhost:3412/Server-Master/categories/all",
				method: 'get',
				contentType: "application/json",
				dataType:"json",
				success : function(data, textStatus, jqXHR){
					var categories_all = data.categories;
					var categories_select = $("#add-parent-category");
					categories_select.append("<option value='null'>NONE</option>");
					for (var i = 0; i < categories_all.length; i++){
						if(categories_all[i].parent == null) {
							categories_select.append("<option value='"+categories_all[i].id+"'>"+categories_all[i].name+"</option>");
						}
						else {
							categories_select.append("<option value='"+categories_all[i].id+"'>"+categories_all[i].parent+" - "+categories_all[i].name+"</option>");
						}
					}
				},
				error: function(data, textStatus, jqXHR){
					console.log("textStatus: " + textStatus);
					alert("No categories found.");
				}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										ACCOUNT DETAILS PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#update-account", function( event, ui ) {
	// currentUser has been set at this point
	$("#edit_first_name").val(currentUser.first_name);
	$("#edit_middle_initial").val(currentUser.middle_initial);
	$("#edit_last_name").val(currentUser.last_name);
	$("#edit_photo_filename").val(currentUser.photo_filename);
	$("#edit_email").val(currentUser.email);
	$("#edit_username").val(currentUser.username);
	$("#edit_description").val(currentUser.description);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										ADDRESS DETAILS PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on('pagebeforeshow', "#edit-address-view", function( event, ui ) {
	// currentAddress has been set at this point
	$("#edit_street_address").val(currentAddress.street_address);
	$("#edit_city").val(currentAddress.city);
	$("#edit_country").val(currentAddress.country);
	$("#edit_state").val(currentAddress.state);
	$("#edit_zipcode").val(currentAddress.zipcode);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										PAYMENT DETAILS PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on('pagebeforeshow', "#edit-payment-view", function( event, ui ) {
	// currentPayment has been set at this point
	$("#edit_card_number").val(currentPayment.card_number);
	$("#edit_card_holder").val(currentPayment.card_holder);
	$("#edit_exp_month").val(currentPayment.exp_month);
	$("#edit_exp_year").val(currentPayment.exp_year);
	$("#edit_security_code").val(currentPayment.security_code);
	
	$("#edit_account_number").val(currentPayment.account_number);
	$("#edit_routing_number").val(currentPayment.routing_number);
	$("#edit_b_account_type").val(currentPayment.b_account_type);
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										PRODUCT DETAILS PAGE										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on('pagebeforeshow', "#edit-product-view", function( event, ui ) {
	// currentProduct has been set at this point

	$("#edit_name").val(currentProduct.name);
	$("#edit_instant_price").val(currentProduct.instant_price);
	$("#edit_model").val(currentProduct.model);
	$("#edit_brand").val(currentProduct.brand);
	$("#edit_description").val(currentProduct.description);
	$("#edit_image_filename").val(currentProduct.image_filename);
	$("#edit_quantity").val(currentProduct.quantity);
	$("#edit_dimensions").val(currentProduct.dimensions);
});

$(document).on('pagebeforeshow', "#add-payment", function( event, ui ) {
	
	var shippingAddresses = currentUser.shippingAddresses;
	var shipAddressList = $('#address-list');
	shipAddressList.empty();
	
	for(var i=0; i < shippingAddresses.length; ++i){
						shipAddressList.append('<li><div><center><strong> Address: '+ shippingAddresses[i].street_address +'</strong></center>'+
						'<center>'+ shippingAddresses[i].city +', '+ shippingAddresses[i].state +' | '+shippingAddresses[i].country+' '+shippingAddresses[i].zipcode+'</center></div></li>'+
						'<li><div><center><a data-role="button" onclick=SelectAddress('+shippingAddresses[i].address_id+') data-icon="check">SELECT</a></center></div></li>');
	}
	//shipAddressList.trigger('create');
	//shipAddressList.listview("refresh");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//							    	Enter Button Fixes - Juan										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
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

$(document).ready(function(){
    $("#login").keypress(function(e){
      if(e.keyCode==13)
      $("#clickLogIn").click();
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////
//										SEARCH														  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {
	var search_field = $('.search-field');
	
	search_field.focus(function() {
		if($(this).val() == "Enter Product Name Here...") {
			this.value = "";
		}
	});
	
	search_field.keypress(function(e){
    	if(e.keyCode==13){
      		var input = $(this).val();
      		$(this).val("");
	        $.ajax({
	          	url : "http://localhost:3412/Server-Master/search/" +  input,
	          	method: 'get',
				contentType: "application/json",
	            success : function(data, textStatus, jqXHR){
	                var productList = data.ListOfProducts;
	                var len = productList.length;
					var list = $("#category-list");
					var list2 = $("#browse-list");
					$(".sort-type").html('<button onclick=sortByType("name") data-mini="true" data-theme="c">SortByName</button><button onclick=sortByType("brand") data-mini="true" data-theme="c">SortByBrand</button><button onclick=sortByType("price") data-mini="true" data-theme="c">SortByPrice</button>').trigger('create');
	                if (len == 1) {
	                	GetProduct(productList[0].product_id);
	                }
	        		
	        		else if(len == 0){
	        	
	        			list.html("<li><h2>Product(s) Not Found!</h2></li>");
	        			list.listview("refresh");	
	        			
	        			list2.html("<li><h2>Product(s) Not Found!</h2></li>");
	        			list2.listview("refresh");	
	        		}
	                else {
	                	list.empty();
	                	list2.empty();
						for (var i=0; i < len; ++i){
							product = productList[i];
							// print in #home
							list.append('<li><a onclick=GetProduct('+product.product_id+')><h2>'+product.name+'</h2>'+
							'<p><img class="img-size" src="'+product.image_filename+'"" /></p>'+ 
							'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(product.current_bid) + '</h4></p>');
							if(product.instant_price > 0.00){
								list.append('<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(product.instant_price) + '</h4></p></a></li>');
							}
							else {
								list.append('</a></li>');
							}
							// print in #browse list
							list2.append('<li><a onclick=GetProduct('+product.product_id+')><h2>'+product.name+'</h2>'+
							'<p><img class="img-size" src="'+product.image_filename+'"" /></p>'+ 
							'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(product.current_bid) + '</h4></p>');
							if(product.instant_price > 0.00){
								list2.append('<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(product.instant_price) + '</h4></p></a></li>');
							}
							else {
								list2.append('</a></li>');
							}	
						} 
						list.listview("refresh");	
						list2.listview("refresh");	    
		            }
	            },
	        	error: function(data, textStatus, jqXHR){
	                console.log("textStatus: " + textStatus);
	                list.html("<li><h2>Server ERROR!</h2></li>");
	        		list.listview("refresh");	
	        			
	        		list2.html("<li><h2>Server ERROR!</h2></li>");
	        		list2.listview("refresh");	
	            }
	        });
	    }
    });
    
    $('.submit').click(function(e){
      	var input = $('.search-field').val();
      	$('.search-field').val("");
        $.ajax({
	      	url : "http://localhost:3412/Server-Master/search/" +  input,
	          	method: 'get',
				contentType: "application/json",
	            success : function(data, textStatus, jqXHR){
	               	                var productList = data.ListOfProducts;
	                var len = productList.length;
					var list = $("#category-list");
					var list2 = $("#browse-list");
					$(".sort-type").html('<button onclick=sortByType("name")>SortByName</button><button onclick=sortByType("brand")>SortByBrand</button><button onclick=sortByType("price")>SortByPrice</button>').trigger('create');
	                if (len == 1) {
	                	GetProduct(productList[0].product_id);
	                }
	        		
	        		else if(len == 0){
	        	
	        			list.html("<li><h2>Product(s) Not Found!</h2></li>");
	        			list.listview("refresh");	
	        			
	        			list2.html("<li><h2>Product(s) Not Found!</h2></li>");
	        			list2.listview("refresh");	
	        		}
	                else {
	                	list.empty();
	                	list2.empty();
						for (var i=0; i < len; ++i){
							product = productList[i];
							// print in #home
							list.append('<li><a onclick=GetProduct('+product.product_id+')><h2>'+product.name+'</h2>'+
							'<p><img class="img-size" src="'+product.image_filename+'"" /></p>'+ 
							'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(product.current_bid) + '</h4></p>');
							if(product.instant_price > 0.00){
								list.append('<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(product.instant_price) + '</h4></p></a></li>');
							}
							else {
								list.append('</a></li>');
							}
							// print in #browse list
							list2.append('<li><a onclick=GetProduct('+product.product_id+')><h2>'+product.name+'</h2>'+
							'<p><img class="img-size" src="'+product.image_filename+'"" /></p>'+ 
							'<p class=\"ui-li-aside\"><h4>Current Bid: ' + accounting.formatMoney(product.current_bid) + '</h4></p>');
							if(product.instant_price > 0.00){
								list2.append('<p class=\"ui-li-aside\"><h4>Buyout: ' + accounting.formatMoney(product.instant_price) + '</h4></p></a></li>');
							}
							else {
								list2.append('</a></li>');
							}	
						} 
						list.listview("refresh");	
						list2.listview("refresh");	    
		            }
	            },
	        	error: function(data, textStatus, jqXHR){
	                console.log("textStatus: " + textStatus);
	                alert("Product not found!");
	            }
        });
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////
//										USER ACCOUNT												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#account", function( event, ui ) {
	// currentUser has been set at this point
	$.mobile.loading("hide");
	$('#bought-history-list').hide();
	$('#sold-history-list').hide();
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/" + currentUser.account_id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$('#ratings-average').empty();
			var user = currentUser;
			$("#userTitle").html(user.username);

			//Populate user information list
			var infoList = $("#user-info");
			infoList.empty();
			infoList.append('<li><center><img class="img-size" src="'+user.photo_filename+'" /></center></li><li><strong>Account ID: </strong>' + user.account_id + '</li></li>'+
				'<li><strong>First Name: </strong>' + user.first_name + '</li></li><li><strong>Last Name: </strong>' + user.last_name + 
				'</li></li><li><strong>Email: </strong>' + user.email + '</li>'	
			);
			infoList.listview("refresh");

			var paymentTypes = data.paymentOptions;
			var ratings = data.ratingsList;
			var sellingProducts = data.sellingProducts;
			var shippingAddresses = data.shippingAddresses;
			var bids = data.bids;
			var boughtProducts = data.boughtHistory;
			var soldProducts = data.soldHistory;
			currentUser.shippingAddresses = shippingAddresses;//Juan Test
			var shipAddressList = $('#shipaddress-list');
			var payList = $('#paymentType-list');
			var ratingsList = $('#ratings-list');
			var sellingList = $('#currentSales-list');
			var bidsList = $('#currentBids-list');
			var boughtList = $('#bought-history-list');
			var soldList = $('#sold-history-list');

			shipAddressList.empty();
			payList.empty();
			ratingsList.empty();
			sellingList.empty();
			bidsList.empty();
			boughtList.empty();
			soldList.empty();

			var maxLength = Math.max(shippingAddresses.length, paymentTypes.length, ratings.length, sellingProducts.length, bids.length, boughtProducts.length, soldProducts.length);

			var avgRating = 0;
			var rCount = 0;
			for(var i=0; i < maxLength; ++i){
				//Populate Address List
				if(i < shippingAddresses.length){
						shipAddressList.append('<li><div><center><strong> Address: '+ shippingAddresses[i].street_address +'</strong></center>'+
						'<center>'+ shippingAddresses[i].city +', '+ shippingAddresses[i].state +' | '+shippingAddresses[i].country+' '+shippingAddresses[i].zipcode+'</center></div></li>'+
						'<li><a onclick=GetAddress('+shippingAddresses[i].address_id+') data-icon="gear">Edit</a></li>'+
						'<li><a onclick=DeleteAddress('+shippingAddresses[i].address_id+') data-icon="trash">Delete</a></li>'
						);
				}
				//Populate Payment Options list
				if(i < paymentTypes.length){
					//Need to add a check later for type if its credit card or paypal
						payList.append('<li><div><center>Card Ending with '+ paymentTypes[i].card_number.substr(15)+'</center>'+
						'<center><strong>Billing Address: </strong>'+paymentTypes[i].street_address+'</center></div></li>'+
						'<li><a onclick=GetPayment('+paymentTypes[i].payment_id+') data-icon="gear">Edit</a></li>'+
						'<li><a onclick=DeletePayment('+paymentTypes[i].payment_id+') data-icon="trash">Delete</a></li>'
						);
				}
				//Populate Ratings by User list
				if(i < ratings.length){
					ratingsList.append('<li>'+ ratings[i].username + ' - '+ ConvertToStars(ratings[i].rating) +'</li>');
					avgRating += ratings[i].rating;
					rCount++;
				}
				//Populate Current Sales list
				if(i < sellingProducts.length){
					sellingList.append('<li><a onclick=GetProduct('+sellingProducts[i].product_id+')><h4>'+sellingProducts[i].name+'</h4></a></li>'+
					'<li><a onclick=GetProductInfo('+sellingProducts[i].product_id+') data-icon="gear">Edit</a></li>'+
					'<li><a onclick=DeleteProduct('+sellingProducts[i].product_id+') data-icon="trash">Delete</a></li>'
					);
				}
				//Populate bids by this user list
				if(i < bids.length){
					bidsList.append('<li><div><center><a onclick=GetProduct('+ bids[i].product_id + ')><strong>'+bids[i].name+'</strong></a> - current highest bid: '+ bids[i].current_bid +'</center>'+
					'<center><p> Your bid: '+bids[i].bid_amount+', placed on '+ bids[i].date_placed+'</p></center></div></li>');
				}
				//History: orders | products bought
				if(i < boughtProducts.length){
					boughtList.append('<li><center><p>Order #'+boughtProducts[i].order_id+'</p>'+
					'<p>From <a onclick="GetSellerProfile('+boughtProducts[i].seller_id+')">'+boughtProducts[i].username+'</a></p>'+
					'<p><a onclick="GetOrder('+boughtProducts[i].order_id+')">View Order Summary</a></p></center>');
					if(boughtProducts[i].rating == null){
						boughtList.append('<div data-role="fieldcontain">'+
						'<center><label for="slider-mini"> Rate this seller:</label></center>'+
						'<p>'+
						'<input id="rating-slider-order_'+boughtProducts[i].order_id+'-product_'+boughtProducts[i].product_id+'" type="text" data-type="range" name="slider-mini" id="slider-mini" value="2" min="0" max="4" step="1" data-highlight="true" data-mini="true" />'+
						'</p>'+
						'<center><a onclick="SubmitRating('+boughtProducts[i].order_id+','+boughtProducts[i].product_id+')" data-icon="ok"> Submit</a></center></div>');
					}
					boughtList.append('</li>');
				}
				//History: products sold
				if(i < soldProducts.length){
					soldList.append('<li><center><p>Sale Order #'+soldProducts[i].order_id+'</p><p>'+soldProducts[i].bought_quantity+' sale of <a onclick="GetProduct('+soldProducts[i].product_id+')">'+soldProducts[i].name+'</a> for '+soldProducts[i].purchase_price+' on '+soldProducts[i].purchase_date+'</p></center>'+
						'</li>');
				}
			}
			// initializes JQuery mobile formating to the appended list elements
			boughtList.trigger('create');
			soldList.trigger('create');

			// These buttons are for adding a new address,payment type or product for sale and are added
			// to the end of the list
			shipAddressList.append('<li><a href="#add-address" data-role="button">Add new address</a></li>');
			payList.append('<li><a href="#add-payment" data-role="button">Add new payment option</a></li>');
			sellingList.append('<li><a href="#add-product" data-role="button">Add new sale</a></li>');

			shipAddressList.listview("refresh");
			payList.listview("refresh");
			ratingsList.listview("refresh");
			sellingList.listview("refresh");
			bidsList.listview("refresh");
			boughtList.listview("refresh");
			soldList.listview("refresh");

			//Populate average rating header
/*			avgRating = avgRating / rCount;
			$('#ratingsdiv').prepend("<h2>Rating: " + Math.floor(avgRating) + "</h2>");
			$('#ratings-average').append("Rating: " + ConvertToStars(avgRating));*/
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
});

function ConvertToStars(rating){
	//Selects number of * for each rating
	switch(rating) {
	  case 0:
	  	return '<span class="ui-icon ui-icon-star-empty"></span>';
	  	break; 
	  case 1:
	  	return '<span class="ui-icon ui-icon-fastar"></span>';
	    break;
	  case 2:
	  	return '<div data-role="controlgroup" data-type="horizontal"><span class="ui-icon ui-icon-fastar"></span>'+
	  			'<span class="ui-icon ui-icon-fastar"></span></div>';
	    break;
	  case 3:
	  	return '<div data-role="controlgroup" data-type="horizontal">'+
	  			'<span class="ui-icon ui-icon-fastar"></span>'+
	  			'<span class="ui-icon ui-icon-fastar"></span>'+
	  			'<span class="ui-icon ui-icon-fastar"></span></div>'; 
	    break;
	  case 4:
	  	return '<div data-role="controlgroup" data-type="horizontal">'+
	  			'<span class="ui-icon ui-icon-fastar"></span>'+
	  			'<span class="ui-icon ui-icon-fastar"></span>'+
	  			'<span class="ui-icon ui-icon-fastar"></span>'+
	  			'<span class="ui-icon ui-icon-fastar"></span></div>'; 
	  	break;
	  default:
	    return 'No Rating';
	};
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//										USER ACCOUNT DETAILS										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

/*$(document).on('pagebeforeshow', "#update-account", function(event, ui){
//  PHASE 1 CODE
	$("#acc-fname").val(currentUser.firstname);
	$("#acc-lname").val(currentUser.lastname);
	$("#acc-email").val(currentUser.email);
	$("#acc-shipaddress").val(currentUser.shipAddress);
	//not finished - missing the logic for changing password
//  PHASE 2 CODE

});*/

//User helper functions
function boughtHistory(){
    $('#bought-history-list').show();
    $('#sold-history-list').hide();
}

function sellHistory(){
    $('#bought-history-list').hide();
    $('#sold-history-list').show();
}

function SubmitRating(oid,pid){
	$.mobile.loading("show");
	alert("Order "+ oid+", Product "+pid);
	var rating_form = $('#rating-slider-order_'+oid+'-product_'+pid);
	$.ajax({
		url : "http://localhost:3412/Server-Master/seller/rating",
		method: 'put',
		data : JSON.stringify({"order_id" : oid, "product_id" : pid, "rating" : rating_form.val()}),
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if(data.status == 404){
				alert("Sale not found.");
			}
			else if (data.status == 400){
				alert("Rating could not be saved!");
			}
			else {
				alert("Internal Server Error.");		
			}
		}
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//										SELLER PROFILE DETAILS										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
var currentSellerId = "";
$(document).on('pagebeforeshow', "#seller-profile", function(event, ui){
	$.ajax({
		url : "http://localhost:3412/Server-Master/seller/" + currentSellerId,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$('#seller-ratings-average').empty();
			var seller = data.seller;
			var ratings = data.ratings;
			var ratings_percentage = data.ratings_percentage;
			var sales = data.selling;

			$.mobile.loading("hide");
			$("#seller-title").html("Seller Name: " + seller.username);
			
			var maxLength = Math.max(ratings.length, sales.length); 

			var infoList = $('#seller-info');
			var ratingsList = $('#seller-ratings-list');
			var sellingList= $('#seller-sales-list');

			infoList.empty();
			ratingsList.empty();
			sellingList.empty();

			//Populate Seller Profile
			infoList.append('<li>Contact Information: '+seller.email+'</li><li>Description: '+seller.description+'</li>');

			var avgRating = 0;
			var rCount = 0;
			for(var i=0; i < maxLength; ++i){
				//Populate Ratings by User list
				if(i < ratings.length){
					ratingsList.append('<li>' + ratings[i].username + ' - '+ ConvertToStars(ratings[i].rating) +'</li>');
					avgRating += ratings[i].rating;
					rCount++;
				}
				//Populate Current Sales list
				if(i < sales.length){
					sellingList.append('<li><a onclick=GetProduct('+sales[i].product_id+')><h4>'+sales[i].name+'</h4></li>'
					);
				}
			}

			infoList.listview("refresh");
			ratingsList.listview("refresh");
			sellingList.listview("refresh");
			
			$('#seller-ratings-average').append("" + ratings_percentage[0].percentage + " of buyers rate this seller " + ConvertToStars(ratings_percentage[0].rating));
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Seller not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
});
////////////////////////////////////////////////////////////////////////////////////////////////////////
//										ADMIN ACCOUNT 										     	  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).on('pagebeforeshow', "#admin", function( event, ui ) {
	// currentUser has been set at this point
	$.ajax({
		url : "http://localhost:3412/Server-Master/admin/" + currentUser.id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			var user = currentUser;
			$('#admin-title').html(user.username);
			var categories = data.categoriesList;
			var users = data.userList;
			
			var maxLength = Math.max(categories.length, users.length); 

			var categoryList = $('#manage-categories-list');
			var userList = $('#manage-users-list');

			categoryList.empty();
			userList.empty();

			//Adds the Add buttons at the top of the lists
			categoryList.append('<li><a href="#add-category" data-role="button">Add new category</a></li>');
			userList.append('<li><a href="#register-account" data-role="button">Add new user</a></li>');

			for(var i=0; i < maxLength; ++i){
				if(i < categories.length){
					if(categories[i].parent == null) {
						categoryList.append('<li><strong>'+categories[i].name +'</strong>'+
						'<a onclick=EditCategory('+categories[i].id+') data-icon="gear">Edit</a>'+
						'<a onclick=DeleteCategory('+categories[i].id+') data-icon="trash">Delete</a></li>');
					}
					else {
						categoryList.append('<li><strong>'+categories[i].parent+' - '+ categories[i].name +'</strong>'+
						'<a onclick=EditCategory('+categories[i].id+') data-icon="gear">Edit</a>'+
						'<a onclick=DeleteCategory('+categories[i].id+') data-icon="trash">Delete</a></li>');
					}

				}
				if(i < users.length){
					userList.append('<li><strong>'+users[i].username +'</strong>'+
					'<a onclick=EditAccount('+users[i].account_id+') data-icon="gear">Edit</a>'+
					'<a onclick=DeleteAccount('+users[i].account_id+') data-icon="trash">Delete</a></li>'
					);
				}
			}
			categoryList.listview("refresh");
			userList.listview("refresh");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Admin not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
});

//Admin helper functions
function ManageCategories(){
	document.location.href="#admin";	
    $('#manage-categories-list').show();
    $('#manage-users-list').hide();
    $('#manage-reports-list').hide();
    $('#reports-form').hide();
}

function ManageUsers(){
	document.location.href="#admin";	
    $('#manage-categories-list').hide();
    $('#manage-users-list').show();
    $('#manage-reports-list').hide();
    $('#reports-form').hide();
}

function ManageReports(){
	document.location.href="#admin";	
    $('#manage-categories-list').hide();
    $('#manage-users-list').hide();
    $('#manage-reports-list').show();
    $('#reports-form').show();
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//										REPORTS	DETAILS												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var reportType = "";
$(document).on('pagebeforeshow', "#report", function( event, ui ) {
	$.ajax({
		url : "http://localhost:3412/Server-Master/admin/"+currentUser.account_id+"/report/" + reportType,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$('#reportType-title').html(reportType);
			var reportInfo = data.report;
			var reportList = $('#manage-reports-list');
			reportList.empty();

			if(reportType == "by Total Sales"){
				for(var i = 0; i < reportInfo.length; ++i){
					reportList.append('<li><h2>Date: '+reportInfo[i].purchase_date+'</h2>'+
					'<p>Sales: '+reportInfo[i].sales+'</p> </li>');	
				}
			}
			else if(reportType == "by Products"){
				for(var i = 0; i < reportInfo.length; ++i){
					reportList.append('<li><h2>Product: '+reportInfo[i].name+':</h2>'+
					'<p>Sales: '+reportInfo[i].sales+'</p> </li>');	
				}
			}
			else {
				for(var i = 0; i < reportInfo.length; ++i){
					reportList.append('<li><h2>Date: '+reportInfo[i].purchase_date+':</h2>'+
					'<p>Revenue: '+reportInfo[i].revenue+' | Sales: '+reportInfo[i].sales+'</p> </li>');	
				}
			}
			reportList.listview("refresh");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Admin not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
});
function ReportBySales(){
	$.mobile.loading("hide");
	reportType = "by Total Sales";
	$.mobile.navigate('#report');
}

function ReportByProducts(){
	$.mobile.loading("hide");
	reportType = "by Products";
	$.mobile.navigate('#report');
}

function ReportByRevenue(){
	$.mobile.loading("hide");
	reportType = "by Revenue";
	$.mobile.navigate('#report');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										PRODUCT	DETAILS												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', "#product-view", function( event, ui ) {
	// currentProduct has been set at this point
	var product = currentProduct;

	$("#product-title").html(product.name);
	$('#seller-details').attr("onclick", "GetSellerProfile("+product.seller_id+")");
	
	if(product.has_auction == true){
		$('#auction-display').show();
		$('#bidButton').attr("onclick", "PlaceBid("+product.product_id+")");

		//if there are no bids disable the reference to the bid history page and current_bid is starting price
		if(product.num_of_bids < 1){
			$('#showBidPrice').html('Place starting bid of ' + accounting.formatMoney(product.current_bid));
			$("#numOfBids").html(product.num_of_bids);
		}
		else {
			$('#showBidPrice').html(accounting.formatMoney(product.current_bid));
			$("#numOfBids").html('<a href="#bidhistory">'+product.num_of_bids+'</a>');
		}
	}
	else {
		$('#auction-display').hide();
	}

	// if product has instant price show it. else, hide buyout elements.
	if(product.instant_price != null){
		$('#buyout-display').show();
		$("#showBuyoutPrice").html(accounting.formatMoney(product.instant_price));
	}
	else{
		$('#buyout-display').hide();
	}

	var list = $("#prod-details");
	list.empty();

	list.append('<li><center><img class="product-img-size" src="'+product.image_filename+'" /></center></li>'+
	'<li><strong>Product ID: </strong>' + product.product_id + '</li><li><strong>Brand: </strong>' + product.brand + '</li>'+
	'<li><strong>Model: </strong>' + product.model + '</li><li><strong>Description: </strong>' + product.description + '</li>'+
	'<li><strong>Dimensions: </strong>'+product.dimensions+'</li>'+
	'<li><strong>Quantity: </strong>'+product.quantity+'</li>'
	);
	list.listview("refresh");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//										BID HISTORY													  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).on('pagebeforeshow', '#bidhistory', function( event, ui ){
	$.ajax({
		url : "http://localhost:3412/Server-Master/product/" + currentProduct.product_id + "/bid-history",
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			var title = $('#history-product-name');
			title.html(currentProduct.name);
			title.attr('onclick', 'GetProduct('+currentProduct.product_id+')');

			var bidHistory = data.bidHistory;
			var list = $('#bidhistory-list');
			list.empty();
			for(var i=0; i < bidHistory.length; ++i){
				list.append('<li>Bidder id <strong>'+bidHistory[i].bidder_id+'</strong> bid <strong>'+accounting.formatMoney(bidHistory[i].bid_amount)+'</strong></li>');
			}
			list.listview('refresh');
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Bid history for product could not be found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											BUTTON FUNCTIONS:										  //
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
		url : "http://localhost:3412/Server-Master/admin/add-category",
		method: 'post',
		data : newCategoryJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#home");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			alert("Data could not be added!");
		}
	});

}

//--------------- GET CATEGORY DETAILS (ADMIN ONLY) ---------------//
function EditCategory(id){
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
			var catCheck = false;
			for (var i = 0; i < currentHistory.length; i++){
				if(currentHistory[i].id == currentCategory.id){
					catCheck = true;
					currentHistory.splice(i+1, currentHistory.length-1-i);
				}
			}
			if (catCheck == false){
				currentHistory.push({"id" : currentCategory.id, "name" : currentCategory.name});
			}
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
	var updCategory = ConverToJSON(formData);
	var updCategoryJSON = JSON.stringify(updCategory);
	
	$.ajax({
		url : "http://localhost:3412/Server-Master/admin/edit-category/" + currentCategory.cid,
		method: 'put',
		data : updCategoryJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#admin");
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
function DeleteCategory(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/home/" + id,
		method: 'delete',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#admin");
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
var currentUser = {"account_id": null}; //-- ??

//--------------- Logs in via POST so it can send the form values of username and password to the server for authentication ---------------//
function LogIn(){
	if($('#loginusername').val() == ""){
		alert("Please type in your username.");
	}
	else {
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
				//add code to clear login form data here
				$.mobile.loading("hide");
				currentUser = data.user;
				$('#loginusername, #loginpassword').val("");
				if (currentUser.permission){
					$.mobile.navigate("#admin");
				}
				else {
					$.mobile.navigate("#account");
				}
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if(data.status == 409){
					alert("Username exists but entered password does not match. Please retype your password.");
				}
				else{
					alert("Username does not exist. Retype username or register if you do not have an account.");
				}
			}
		});
	}
}

//--------------- GET USER ACCOUNT + PRIVILEGES(in the future). If user is user it loads user account; if admin, loads admin controls page ---------------//
function GetAccount(){
	$.mobile.loading("show");
	if(currentUser.account_id == null){
		$.mobile.loading("hide");
		$.mobile.navigate("#login");
	}
	else if (currentUser.permission){
		$.mobile.navigate("#admin");
	}
	else {
		$.mobile.navigate("#account");
	}
}

// GET SELLER RATING PAGE
function GetSellerProfile(id){
	$.mobile.loading("show");
	currentSellerId = id;
	$.mobile.navigate("#seller-profile");
}
//--------------- REGISTER NEW USER ACCOUNT - Checks if passwords do not match before sending information, and cheks if username is already taken ---------------//
function RegisterAccount(){
	if($('#new-username').val() == ""){
		alert("Please type in a username of your choosing.");
	}
	else if($('#new-password').val() == "" || $('#new-confirmpassword').val() == ""){
		alert("Password fields cannot be blank. Please choose a password of at least 6 characters");
	}
	else if( $('#new-password').val() != $('#new-confirmpassword').val()){
		alert("Password fields do not match. Please type them again.");
	}
	else{
		
		var the_form = $('#form_register');
		var formData = the_form.serializeArray();
		console.log("form Data: " + formData);
		var newUser = ConverToJSON(formData);
		console.log("User Login: " + JSON.stringify(newUser));
		var newUserJSON = JSON.stringify(newUser);
		$.mobile.loading("show");
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
function UpdateAccount(){
	if($('#edit_password').val() == "" || $('#edit_confirm_password').val() == ""){
		alert("Password fields cannot be blank. Please choose a password of at least 6 characters");
	}
	else if( $('#edit_password').val() != $('#edit_confirm_password').val()){
		alert("Password fields do not match. Please type them again.");
	}
	else {
		$.mobile.loading("show");
		var form = $('#update-account-form');
		var formData = form.serializeArray();
		var updAccount = ConverToJSON(formData);
		var updAccountJSON = JSON.stringify(updAccount);
		$.ajax({
			url : "http://localhost:3412/Server-Master/account/" + currentUser.account_id,
			method: 'put',
			data : updAccountJSON,
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#home");
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if (data.status == 409){
					alert("Account data could not be updated, check for incorrect or invalid fields!");
				}
				else if (data.status == 401) {
					alert("Old password incorrect");		
				}
				else {
					alert("An error has occured");
				}
			}
		});
	}	
}

function DeleteAccount(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/" + id,
		method: 'delete',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#admin");
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

//--------------- LOG CURRENT USER ACCOUNT and resets global variables to their initial state---------------//
function LogOut(){
	var uExit = confirm("Do you want to log out?");
	if(uExit == true){
		$.mobile.loading("show");
		//global variables are reset to initial values.
		currentUser = {"account_id": null};
		
		//Empty User Specific Arrays
		Cart = [];
		ShipAddressess = [];
		PayAddressess = [];
		
		$.mobile.loading("hide");
		$.mobile.navigate("#home");
	}
	else{
		$.mobile.loading("hide");
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE USER ADDRESS										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentAddress = {}; //address obtained in GetAddress PS: These Annoy Rick so they are fun
function GetAddress(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/address/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			currentAddress = data.address;
			$.mobile.loading("hide");
			$.mobile.navigate("#edit-address-view");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Address not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
}

function AddAddress(){
$.mobile.loading("show");
	var form = $("#add-address-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var newAddress = ConverToJSON(formData);
	console.log("New Address: " + JSON.stringify(newAddress));
	var newAddressJSON = JSON.stringify(newAddress);
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/address/"+currentUser.account_id,
		method: 'post',
		data : newAddressJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#account");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			alert("Data could not be added!");
		}
	});
}

function EditAddress(){
$.mobile.loading("show");
	var form = $("#address-view-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var updAddress = ConverToJSON(formData);
	console.log("Updated Address: " + JSON.stringify(updAddress));
	var updAddressJSON = JSON.stringify(updAddress);
	//alert(updAddressJSON);
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/address/" + currentAddress.address_id,
		method: 'put',
		data : updAddressJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#account");
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

function DeleteAddress(id){
		$.mobile.loading("show");
		$.ajax({
			url : "http://localhost:3412/Server-Master/address/" + id,
			method: 'delete',
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#account");
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if (data.status == 404){
					alert("Address not found.");
				}
				else {
					alert("Internal Server Error.");
				}
			}
		});	
}

function SelectAddress(id){
	currentAddress.address_id = id;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE USER PAYMENTS										  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentPayment = {}; //payment obtained in GetPayment PS: These Annoy Rick so they are fun

function GetPayment(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/payment/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			currentPayment = data.payment;
			currentPayment.payment_id = id;
			$.mobile.loading("hide");
			$.mobile.navigate("#edit-payment-view");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Payment not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
}

function AddPayment(){
$.mobile.loading("show");
	var form = $("#add-payment-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var newPayment = ConverToJSON(formData);
	newPayment.address_id = currentAddress.address_id;
	console.log("New Payment: " + JSON.stringify(newPayment));
	var newPaymentJSON = JSON.stringify(newPayment);
	if(currentAddress.address_id != null){
		$.ajax({
			url : "http://localhost:3412/Server-Master/account/payment/"+currentUser.account_id,
			method: 'post',
			data : newPaymentJSON,
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#account");
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				alert("Data could not be added!");
			}
		});
	}
	else{
		$.mobile.loading("hide");
		alert("Must Select Address");
	}
}

function EditPayment(){
$.mobile.loading("show");
	var form = $("#payment-view-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var updPayment = ConverToJSON(formData);
	console.log("Updated Payment: " + JSON.stringify(updPayment));
	var updPaymentJSON = JSON.stringify(updPayment);
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/payment/" + currentPayment.payment_id,
		method: 'put',
		data : updPaymentJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#account");
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

function DeletePayment(id){
		$.mobile.loading("show");
		$.ajax({
			url : "http://localhost:3412/Server-Master/payment/" + id,
			method: 'delete',
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#account");
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if (data.status == 404){
					alert("Payment not found.");
				}
				else {
					alert("Internal Server Error.");
				}
			}
		});	
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE PRODUCT												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentProduct = {}; //product obtained in GetProduct

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

function GetProductInfo(id){
	$.mobile.loading("show");
	$.ajax({
		url : "http://localhost:3412/Server-Master/product/" + id,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			currentProduct = data.product;
			$.mobile.loading("hide");
			$.mobile.navigate("#edit-product-view");
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

function AddProduct(){
	$.mobile.loading("show");
	var form = $("#add-product-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var newProduct = ConverToJSON(formData);
	console.log("New Product: " + JSON.stringify(newProduct));
	var newProductJSON = JSON.stringify(newProduct);
	$.ajax({
		url : "http://localhost:3412/Server-Master/product/"+currentUser.account_id,
		method: 'post',
		data : newProductJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#account");
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			alert("Data could not be added!");
		}
	});
}

// Toggle auction fields when adding a product
function auctionForms() {
	$('#add-buyout-li').val("");
	$('#add-buyout-li').hide();
    $("#add-product-auction").show();  // checked
};

function salesForms() {
    $('#add-buyout-li').show();
    $("#add-product-auction").hide();  // checked
    $('#add-product-bid').val("");
    $('#add-product-auc-buyout').val("");
    $('#add-auc-days').val("");
    $('#add-auc-hours').val("");
};

/*if($("#checkbox_auction").is(':checked')){
	$('#add-buyout-li').hide();
    $("#add-product-auction").show();  // checked
}
else {
    $('#add-buyout-li').show();
    $("#add-product-auction").hide();  // checked
}*/


$( document ).on( "pageinit", "#add-product", function( event ) {
	$('#checkbox-auction').click(function () {
	    $('#add-product-auction').toggle(this.checked);
	    $('#add-buyout-li').toggle();
	});
});

function EditProduct(){
	$.mobile.loading("show");
	var form = $("#product-view-form");
	var formData = form.serializeArray();
	console.log("form Data: " + formData);
	var updProduct = ConverToJSON(formData);
	
	console.log("Updated Product: " + JSON.stringify(updProduct));
	var updProductJSON = JSON.stringify(updProduct);
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/product/" + currentProduct.product_id,
		method: 'put',
		data : updProductJSON,
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			$.mobile.loading("hide");
			$.mobile.navigate("#account");
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
function DeleteProduct(id){
	$.mobile.loading("show");
		$.ajax({
			url : "http://localhost:3412/Server-Master/product/" + id,
			method: 'delete',
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#account");
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

function PlaceBid(id){
	
	if(currentUser.account_id == null){
		$.mobile.navigate('#login');
	}
	else{
		$.mobile.loading("show");
		var form = $("#bidInput-form");
		var formData = form.serializeArray();
		var newBid = ConverToJSON(formData);
		newBid.auction_id = currentProduct.auction_id;
		newBid.bidder_id = currentUser.account_id;
		var newBidJSON = JSON.stringify(newBid);
		
		//alert(newBidJSON);
		
		if(parseFloat((newBid.new_current_bid)) > parseFloat((currentProduct.current_bid))){
			//Replace current bid with new bid and add current to list of bids
			$.ajax({
			url : "http://localhost:3412/Server-Master/home/product/"+id+"/bid",
			method: 'post',
			data : newBidJSON,
			contentType: "application/json",
			dataType:"json",
			success : function(data, textStatus, jqXHR){
				$.mobile.loading("hide");
				$.mobile.navigate("#home");
			},
			error: function(data, textStatus, jqXHR){
				console.log("textStatus: " + textStatus);
				$.mobile.loading("hide");
				if (data.status == 404){
					alert("Bid could not be placed!");
				}
				else {
					alert("Internal Server Error.");		
				}
			}
			});
		}
		else{
			$.mobile.loading("hide");
			alert("Bid Must Be Higher than Current!");
		}
	}
}

function Buyout(){
	addToCart();
	checkout();
}

function sortByType(type){
	
	SortType=type;
	 	
	document.location.href="#browse";			
	
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE CART												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////
var Cart=[];//ARRAY OF CURRENT PRODUCTS IN CART
//--------------- ADD PRODUCTS TO CART ---------------//
function addToCart(){
	var ID = currentProduct.product_id;
	var New=true;
	for(i=0;i<Cart.length;i++)
		if(ID==Cart[i].product_id){
			New=false;
			alert("Product is in Cart");
		}
	if(New){
        Cart.push(currentProduct);
		alert("Product has been added");
	}
}

//--------------- REMOVE PRODUCTS FROM CART ---------------//
function removeFromCart(Index){
	Cart.splice(Index,1);
	alert("Deleted");
	document.location.href="#cart";
}

function checkout(){
	if(currentUser.account_id == null){
		$("#ForceLogin").click();//IF it's a Guest Force Him to Log In
	}
	else if (currentUser.permission){
		alert("Admins can't have nice things... :P");//Admins Should not be buying things... (-.-)
	}
	else {
		if(Cart.length==0){//Buying nothing?
			alert('Cart Is Empty');
		}
		else if(invoiceShipAddress == null){
			alert('Please select a Shipping Address!');
		}
		else if(invoiceBillAddress == null){
			alert('Please select a Payment Option!');
		}
		else{
			document.location.href="#invoice";//Invoice
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
//											THE INVOICE												  //
////////////////////////////////////////////////////////////////////////////////////////////////////////

function InvoiceAddress(index){
		invoiceShipAddress = ShipAddressess[index];
		$("#ShipAddressSelected").html(ShipAddressess[index]);
}

function InvoicePayment(index,number){
		invoiceBillAddress = "Card ending in: "+number+" "+PayAddressess[index];
		$("#PayAddressSelected").html("<p>Card ending in: "+number+"</p><p> Billed to: "+PayAddressess[index]+"</p>");
}


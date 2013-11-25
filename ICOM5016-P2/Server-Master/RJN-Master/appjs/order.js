var currentOrder;

$(document).on('pagebeforeshow', "#order-summary", function( event, ui ) {
	// currentOrder has been set at this point
	$.ajax({
		url : "http://localhost:3412/Server-Master/account/orders/" + currentOrder,
		method: 'get',
		contentType: "application/json",
		dataType:"json",
		success : function(data, textStatus, jqXHR){
			var order = data.order;
			//var products = data.products;
			$('#order-id').html(order.order_id);
			$('#order-date').html(order.purchase_date)
			//$('#order-shipping').html('<li>'+order.shipping_address+'</li>');
			$('#order-billing').html('<li><center>Card Ending with '+ order.card_number.substr(15)+'</center><center><strong>Billing Address: </strong>'+order.billing_address+'</center></li>');
			
			var list = $('#order-checkout-list');
			list.empty();
			//for(var i = 0; i < order.length; i++){
				list.append('<li><h4>Product '+order.name+' from seller '+order.seller+'</h4>'+
							'<p class=\"ui-li-aside\"><h4>Price: ' + accounting.formatMoney(order.purchase_price) + '</h4></p>'+
							'<p class=\"ui-li-aside\"><h4>Quantity: ' + order.bought_quantity + '</h4></p></li>');
			//}
			list.listview('refresh');
		},
		error: function(data, textStatus, jqXHR){
			console.log("textStatus: " + textStatus);
			$.mobile.loading("hide");
			if (data.status == 404){
				alert("Order summary not found.");
			}
			else {
				alert("Internal Server Error.");
			}
		}
	});
});

function GetOrder(id){
	$.mobile.loading("show");
	currentOrder = id;
	$.mobile.loading("hide");
	$.mobile.navigate("#order-summary");
}
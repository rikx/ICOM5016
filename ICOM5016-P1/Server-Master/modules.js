module.exports =  { 
	Category: function (id, name, parent){
		this.id = id;
		this.name = name;
		this.parent = parent;
	},
	
	Product: function(name,parent,sellerId,instantPrice,bidPrice,description,model,brand,dimensions,numBids){
		this.id="";
		this.name = name;
		this.parent = parent;
		this.sellerId = sellerId;
		this.instantPrice = instantPrice;
		this.bidPrice = bidPrice; //current highest bid
		this.description = description;
		this.model = model;
		this.brand = brand;
		this.dimensions= dimensions;
		this.numBids = numBids;
	},

	ProductBid: function(productId, bidderId, bidPrice){
		this.id="";
		this.productId = productId;
		this.bidderId = bidderId;
		this.bidPrice = bidPrice;
	},
	
	User: function (type, username, password, firstname, lastname, email, shipAddress, billAddress){
		this.id = "";
		this.type = type;
		this.username = username;
		this.password = password;
		this.firstname = firstname;
		this.lastname = lastname;
		this.email = email;
		this.shipAddress = shipAddress;
		this.billAddress = billAddress;
	},

	ShippingAddress: function(userId, address){
		this.id="";
		this.userId = userId;
		this.address = address;
	},
	
	PaymentType: function (userId, type, cNumber, billAddress){
		this.id="";
		this.type = type;
		this.userId = userId;
		this.cNumber = cNumber;
		this.billAddress = billAddress;
	},

	Rating: function(sellerId, raterId, rating){
		this.id="";
		this.sellerId = sellerId;
		this.raterId = raterId;
		this.rating = rating;
	}
};


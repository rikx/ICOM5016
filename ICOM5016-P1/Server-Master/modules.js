module.exports =  { 
	Category: function (id, name, parent){
		this.id = id;
		this.name = name;
		this.parent = parent;
	},
	
	Product:function(name,parent,instantPrice,bidPrice,description,model,brand,dimensions){
		this.id="";
		this.parent=parent;
		this.name = name;
		this.instantPrice = instantPrice;
		this.bidPrice = bidPrice;
		this.description = description;
		this.model = model;
		this.brand = brand;
		this.dimensions= dimensions;
	},
	
	User: function (type, username, password, firstname, lastname, email, shipAddress, billAddress, ccInfo){
		this.id = "";
		this.type = type;
		this.username = username;
		this.password = password;
		this.firstname = firstname;
		this.lastname = lastname;
		this.email = email;
		this.shipAddress = shipAddress;
		this.billAddress = billAddress;
		this.ccInfo = ccInfo;
	}

};


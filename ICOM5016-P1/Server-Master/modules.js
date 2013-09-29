module.exports =  { 
	Category: function (name){//, model, year, description, price){
		this.id = "";
		this.name = name;
		/*
		 * DON'T DELETE
		this.model = model;
		this.year = year;
		this.description = description;
		this.price = price;*/
	},
	
	Subcategory:function(name){
		this.id="";
		this.name = name;
	},
	
	Product:function(name,instantPrice,bidPrice,description,model,brand,dimensions){
		this.id="";
		this.name = name;
		this.instantPrice = instantPrice;
		this.bidPrice = bidPrice;
		this.description = description;
		this.model = model;
		this.brand = brand;
		this.dimensions= dimensions;
	},
	
	User: function (name, type, username, password, description){
		this.id = "";
		this.name = name;
		this.type = type;
		this.username = username;
		this.password = password;
		this.description = description;
	}

};


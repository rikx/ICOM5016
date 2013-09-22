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
	User: function (name, type){
		this.id = "";
		this.name = name;
		this.type = type;
	}
};




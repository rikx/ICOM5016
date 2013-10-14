//Given an initial posting time and an auction duration, determine remaining time.
	//Sample postTime: 
	//Sample Duration: {"hours": 0, "minutes" : 14, "seconds" : 30}
function AuctionTimer(postTime, duration){
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
    
	m = addZero(m);
	s = addZero(s);
	//add code to do countdown instead of showing time

	$('#auction-timer').html(h+":"+m+":"+s);
	t=setTimeout(function(){AuctionTimer()
	},500);
}

// add zero infront of single digits
function addZero(digit){
	if (digit < 10){
		digit = "0" + digit;
	}
	return digit;
}
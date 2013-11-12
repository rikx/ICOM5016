//Given an initial posting time and an auction duration, determine remaining time.
	//Sample postTime: 
	//Sample Duration: {"hours": 0, "minutes" : 14, "seconds" : 30}
/*function AuctionTimer(postTime, duration){
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
*/

var Timer;
var TotalSeconds;

function CreateTimer(TimerID, Time) {
	Timer = document.getElementById(TimerID);
	TotalSeconds = Time;

	UpdateTimer()
	window.setTimeout("Tick()", 1000);
}

function Tick() {
	if (TotalSeconds <= 0) {
		Timer.innerHTML = "Auction has ended";
	return;
	}
	TotalSeconds -= 1;
	UpdateTimer()
	window.setTimeout("Tick()", 1000);
}

function UpdateTimer() {
	var Seconds = TotalSeconds;

	var Days = Math.floor(Seconds / 86400);
	Seconds -= Days * 86400;

	var Hours = Math.floor(Seconds / 3600);
	Seconds -= Hours * (3600);

	var Minutes = Math.floor(Seconds / 60);
	Seconds -= Minutes * (60);


	var TimeStr = ((Days > 0) ? Days + " days " : "") + addLeadingZero(Hours) + ":" + addLeadingZero(Minutes) + ":" + addLeadingZero(Seconds)


	Timer.innerHTML = TimeStr + " until auction ends";

	// add zero infront of single digits
	function addLeadingZero(time){
		if (time < 10){
			time = "0" + time;
		}
		return time;
	}
}



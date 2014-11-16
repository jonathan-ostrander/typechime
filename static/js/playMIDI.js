// Bjorklund Rhythm Generation

/*
 
An implementation of the Bjorklund algorithm in JavaScript
 
Inspired by the paper 'The Euclidean Algorithm Generates Traditional Musical Rhythms' 
by Godfried Toussaint

This is a port of the original algorithm by E. Bjorklund which I
found in the paper 'The Theory of Rep-Rate Pattern Generation in the SNS Timing Systems' by
E. Bjorklund.
 
Jack Rutherford
 
*/
 
 
function bjorklund(steps, pulses) {
	
	steps = Math.round(steps);
	pulses = Math.round(pulses);	
 
	if(pulses > steps || pulses == 0 || steps == 0) {
		return new Array();
	}
 
	pattern = [];
	   counts = [];
	   remainders = [];
	   divisor = steps - pulses;
	remainders.push(pulses);
	level = 0;
 
	while(true) {
		counts.push(Math.floor(divisor / remainders[level]));
		remainders.push(divisor % remainders[level]);
		divisor = remainders[level]; 
	       level += 1;
		if (remainders[level] <= 1) {
			break;
		}
	}
	
	counts.push(divisor);
 
	var r = 0;
	var build = function(level) {
		r++;
		if (level > -1) {
			for (var i=0; i < counts[level]; i++) {
				build(level-1); 
			}	
			if (remainders[level] != 0) {
	        	build(level-2);
			}
		} else if (level == -1) {
	           pattern.push(0);	
		} else if (level == -2) {
           pattern.push(1);        
		} 
	};
 
	build(level);
	return pattern.reverse();
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function loadMIDI() {
	MIDI.loadPlugin({
		soundfontUrl: "/soundfont/",
		instruments: [ "acoustic_grand_piano"],
		callback: function() {}
	});
}

var KEYS = ["dma","fma","cma","bbmi","fsma","fmi","bmi"];
var MAJOR = [-3,-1,0,2,4,5,7,9,11,12,14,16,17,19,21]
var MINOR = [-4,-2,0,2,3,5,7,8,10,12,14,15,17,19,20]

function scaleCreate(key) {
	var base = (key.length == 4 ? key.substr(0,2) : key.substr(0,1));
	var basenote = MIDI.keyToNote[base.toProperCase() + '4'];
	var scale = [];
	var scaletype = (key.substr(-2,2) == 'ma' ? MAJOR : MINOR);
	for(var i=0;i<scaletype.length;i++) {
		scale.push(basenote + scaletype[i]);
	}
	return scale;
}


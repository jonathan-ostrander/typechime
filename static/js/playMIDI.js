String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function loadMIDI() {
	MIDI.loadPlugin({
		soundfontUrl: "/static/soundfont/",
		instruments: [ "acoustic_grand_piano"],
		callback: function() {}
	});
}

var MAJOR = [-7,-5,-3,-1,0,4,7,9,11,12,14,16,17,19,21]
var MINOR = [-7,-5,-4,-2,0,3,7,8,10,12,14,15,17,19,20]

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


// Connect to socketio instance

var socket = io.connect();

$(function () {loadMIDI()});
// initialize noteQueue and BPM

var noteQueue = [];
var currentBPM = 110;
var key = 'cma';
var currentScale = scaleCreate('cma')
var scores = {pos: [0], neg: [0], neu: [1]};
var last_note_time = 0;

// Save info from python

socket.on('new_notes', function(msg){
	addNotes(msg['notes']);
	scores = msg['scores'];
	if (key != msg['key']) {
		changeKey(msg['key']);
	};
});

// Initialize Times

var iLastTime = 0;
var iTime = 0;
var iTotal = 0;
var iKeys = 0;

function checkCPM() {
    iTime = new Date().getTime();

    if (iLastTime != 0) {
        iKeys = $('#maininp').val().length - iKeys;
        iTotal += iTime - iLastTime;
        var cpm = Math.round(iKeys / iTotal * 60000, 2);
    }

    iLastTime = iTime;
    console.log(cpm);
    return cpm;
}

function cpmToBPM(cpm) {
	var bpm = 66.03*Math.log(0.0442*cpm);
	console.log(bpm);
	return (bpm < 60 ? 60 : bpm)
}

function changeTempo() {
    iTime = new Date().getTime();

    if (iLastTime != 0) {
        iKeys = $('#maininp').val().length - iKeys;
        console.log(iKeys);
        iTotal += iTime - iLastTime;
        var cpm = Math.round(iKeys / iTotal * 60000, 2);
    }

    iLastTime = iTime;
    console.log(cpm);
	var bpm = (cpm ? 66.03*Math.log(0.0442*cpm) : 110);
	console.log(bpm);
	return (bpm < 60 ? 60 : bpm)
}

// emit event when last input was space

$("#maininp").on('input', function() {
	if ($(this).val().substr(-1,1) === " ") {
		var cur_str = $(this).val().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
		var last_word = cur_str.split(" ").slice(-2)[0];
		addRest();
		socket.emit('new_word', {word:last_word,scores:scores});
	}
	if ($(this).val().substr(-1,1) === ".") {
		currentBPM = changeTempo();
	}
});

// change current key and update to new scale

function changeKey(new_key) {
	key = new_key;
	currentScale = scaleCreate(key);
}

function addNotes(notes) {
	for(var i=0;i<notes.length;i++) {
		note = currentScale[notes[i]];
		curTime = new Date().getTime();
		delay = (last_note_time != 0 ? (last_note_time - curTime)/1000 + 60/currentBPM : 0);
		delay = (delay < 0 ? 0 : delay);
		MIDI.noteOn(0, note, 150, delay);
		last_note_time = curTime + delay*1000;
	}
}

function addRest() {
	last_note_time += 1000*60/(currentBPM);
}
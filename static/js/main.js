// Connect to socketio instance

var socket = io.connect();

$(function () {
	loadMIDI();
	$("textarea").autosize();
});

var CHORDS = {"4 5 6": "6 8 10", "6 8 10": "7 9 11", "7 9 11": "5 6 8", "5 6 8": "17 7 9", "17 7 9": "4 5 6"};
var curChord = "4 5 6";
var chord_changes = bjorklund(1000 + Math.floor(Math.random()*100),300 + Math.floor(Math.random()*100));
// initialize noteQueue and BPM

var noteQueue = [];
var currentBPM = 400;
var key = 'cma';
var currentScale = scaleCreate('cma')
var scores = {pos: [0], neg: [0], neu: [1]};
var last_note_time = 0;
var word_count = 0;
// Save info from python

socket.on('new_notes', function(msg){
	if (chord_changes[word_count % chord_changes.length] == 1) {
		playCurChord();
	}
	addNotes(msg['notes']);
	scores = msg['scores'];
	if (key != msg['key']) {
		changeKey(msg['key']);
	};
	word_count++;
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
    return cpm;
}

function cpmToBPM(cpm) {
	var bpm = 1.5*cpm;
	return (bpm < 100 ? 100 : bpm)
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
	if ($(this).val().substr(-1,1) === " " || $(this).val().substr(-1,1) === "\n") {
		if ($("h2")) {
			$("h2").remove();
		}
		var cur_str = $(this).val().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
		var last_word = cur_str.split(" ").slice(-2)[0];
		addRest();
		socket.emit('new_word', {word:last_word,scores:scores});
	}
	if ($(this).val().substr(-1,1) === "." || $(this).val().substr(-1,1) === "\n") {
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

function playCurChord() {
	var chordType = curChord.split(" ");
	var chord = [];
	for(var i=0;i<chordType.length;i++){
		chord.push(currentScale[chordType[i]] - 12);
	}
	curTime = new Date().getTime();
	delay = (last_note_time != 0 ? (last_note_time - curTime)/1000 + 60/currentBPM : 0);
	MIDI.chordOn(1, chord, 400, delay);
	curChord = CHORDS[curChord];
}

function addRest() {
	last_note_time += 1000*60/(currentBPM);
}
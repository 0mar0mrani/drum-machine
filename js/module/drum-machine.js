export default function DrumMachine() {
	// Data
	const bpm = 120;
	const bpmInMilliseconds = (60 / bpm) * 1000;


	const halfNote = bpmInMilliseconds * 2;
	const eightNote = bpmInMilliseconds / 2
	
	let isPlaying = false; 
	const playButton = document.querySelector('.drum-machine__play-button');

	const kick = new Audio('/assets/audio/kick.wav'); 
	const snare = new Audio('/assets/audio/snare.wav'); 
	const hihatClosed = new Audio('/assets/audio/hihat-closed.wav'); 

	playButton.addEventListener('click', handlePlayButtonClick)

	function handlePlayButtonClick() {
		isPlaying = !isPlaying;

		toggleKickPattern();
		toggleSnarePattern();
		toggleHihatClosedPattern();
	}

	let kickPattern;
	let hatPattern;
	let snarePattern;

	function toggleHihatClosedPattern() {
		if (isPlaying) {
			hatPattern = setInterval(function() {
				hihatClosed.play();
			}, eightNote) 
		} else {
			clearInterval(hatPattern)
		}
	}

	function toggleKickPattern() {

		if (isPlaying) {
			kickPattern = setInterval(function() {
				kick.play();
			}, bpmInMilliseconds) 
		} else {
			clearInterval(kickPattern)
		}
	}

	function toggleSnarePattern() {
		if (isPlaying) {
			snarePattern = setInterval(function() {
				snare.play();
			}, halfNote) 
		} else {
			clearInterval(snarePattern)
		}
	}
}
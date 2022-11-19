import Sequencer from "./sequencer.js";

export default function DrumMachine() {
	let sequencerModules = []

	const allSequences = document.querySelectorAll('.drum-machine__sequencer');

	for (let index = 0; index < allSequences.length; index += 1) {
		sequencerModules.push(Sequencer(allSequences[index], index));
	}

	// Data
	const bpm = 120;
	const bpmInMilliseconds = (60 / bpm) * 1000;
	const sixteenthNoteInMilliseconds = bpmInMilliseconds / 4;

	let isPlaying = false; 
	let currentPatternIndex = 0;

	const samplePaths = ['/assets/audio/hihat.wav', '/assets/audio/perc.wav', '/assets/audio/snare.wav', '/assets/audio/kick.wav']

	let timerID;
	let triggerID;
	const audioContext = new AudioContext();

	const lookahead = 25.0; 
	const scheduleAheadTime = 0.1; 
	let nextTriggerTime = 0 

	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);

	// Handlers	
	function handlePlayButtonClick() {
		toggleIsPlaying();
		toggleSequence();
		
		if (!isPlaying) {
			resetDrumMachine();
		}
	}

 
	//Methods
	function toggleIsPlaying () {
		isPlaying = !isPlaying;

		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleIsPlaying();
		}
	}

	function scheduler() {	
		if (nextTriggerTime === 0) {
			nextTriggerTime = audioContext.currentTime;
		}

		while (nextTriggerTime < audioContext.currentTime + scheduleAheadTime) {
			for (const sequencerModule of sequencerModules) {
				if (sequencerModule.pattern[currentPatternIndex]) {
					sequencerModule.scheduleSample(audioContext, nextTriggerTime);
				}
			}
			
			triggerID = setTimeout(scheduleToggleActiveClass(currentPatternIndex), scheduleAheadTime);
			nextTriggerTime += (sixteenthNoteInMilliseconds / 1000); 
			setNextPatternIndex();
		}

		timerID = setTimeout(scheduler, lookahead);
	}

	function scheduleToggleActiveClass(currentPatternIndex) {
		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleActiveClass(currentPatternIndex);
		}
	}

	function toggleSequence() {
		if (isPlaying) {
			audioContext.resume();
			scheduler();

		} else {
			audioContext.suspend();
			clearInterval(timerID);
		}
	}

	function setNextPatternIndex() {
		if (currentPatternIndex === 15) {
			currentPatternIndex = 0;
		} else {
			currentPatternIndex += 1;
		}
	}
	
	function resetDrumMachine() {
		for (const sequencerModule of sequencerModules) {
			sequencerModule.removeActiveClass();
		}
		
		currentPatternIndex = 0;
	}

	// Called methods
	for (const sequencerModule of sequencerModules) {
		sequencerModule.loadAudioIntoBuffer(audioContext, samplePaths);
	}
}
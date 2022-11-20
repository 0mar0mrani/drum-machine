import Sequencer from "./sequencer.js";
import Patterns from "./patterns.js";

export default function DrumMachine() {
	// Get Data from import
	const sequencerModules = []

	const allSequences = document.querySelectorAll('.drum-machine__sequencer');
	for (let index = 0; index < allSequences.length; index += 1) {
		sequencerModules.push(Sequencer(allSequences[index], index));
	}
	const patterns = Patterns();

	// Data
	let bpm = 120;
	let sixteenthNoteInMilliseconds;
	let isPlaying = false; 
	let isExtremeTempo = false;
	let currentPatternIndex = 0;

	const HouseSamples = ['/assets/audio/house/hihat.mp3', '/assets/audio/house/perc.mp3', '/assets/audio/house/snare.mp3', '/assets/audio/house/kick.mp3'];
	const hiphopSamples = ['/assets/audio/hiphop/hihat.mp3', '/assets/audio/hiphop/perc.mp3', '/assets/audio/hiphop/snare.mp3', '/assets/audio/hiphop/kick.mp3'];
	const acousticSamples = ['/assets/audio/acoustic/hihat.mp3', '/assets/audio/acoustic/perc.mp3', '/assets/audio/acoustic/snare.mp3', '/assets/audio/acoustic/kick.mp3'];
	let samplePaths = HouseSamples;

	let timerID;
	let triggerID;
	const audioContext = new AudioContext();

	const lookahead = 25.0; 
	const scheduleAheadTime = 0.1; 
	let nextTriggerTime = 0 

	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');
	const playButtonIcon = document.querySelector('.drum-machine__play-button-icon');
	const tempoSlider = document.querySelector('.drum-machine__tempo-slider');
	const tempoDisplay = document.querySelector('.drum-machine__tempo-display');
	const selectSamples = document.querySelector('.drum-machine__select-samples');
	const selectPattern = document.querySelector('.drum-machine__select-pattern');
	const extremeButton = document.querySelector('.drum-machine__tempo-extreme-button')

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);
	tempoSlider.addEventListener('input', handleTempoSliderChange);
	selectSamples.addEventListener('change', handleSelectSamplesChange);
	selectPattern.addEventListener('change', handleSelectPatternChange);
	extremeButton.addEventListener('click', handleExtremeButtonClick);

	// Handlers	
	function handlePlayButtonClick() {
		toggleIsPlaying();
		toggleSequence();	
		if (!isPlaying) {
			resetDrumMachine();
		}
		renderHtml();
	}

	function handleTempoSliderChange() {
		changeBpm();
		renderHtml();
	}

	function handleSelectPatternChange() {
		let newPattern;
		let newBpm

		switch(selectPattern.value) {
			case 'house':
				newPattern = patterns.housePattern;
				newBpm = 120;
				break
			case 'hiphop':
				newPattern = patterns.hiphopPattern;
				newBpm = 140;
				break
			case 'acoustic':
				newPattern = patterns.acousticPattern;
				newBpm = 110;
				break
		}

		changeBpm(newBpm);
		applyNewDrumPattern(newPattern);
		loadNewSamplesToBuffer(selectPattern.value);
		renderHtml();
	}

	function handleSelectSamplesChange() {
		loadNewSamplesToBuffer(selectSamples.value);
	}

	function handleExtremeButtonClick() {
		isExtremeTempo = !isExtremeTempo;
		toggleExtremeTempo();
		renderExtremeButton();
	}
 
	//Methods
	function toggleIsPlaying () {
		isPlaying = !isPlaying;

		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleIsPlaying();
		}
	}

	function calculateSixteenthNote() {
		const bpmInMilliseconds = (60 / bpm) * 1000;
		sixteenthNoteInMilliseconds = bpmInMilliseconds / 4;
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
			setNextCurrentPatternIndex();
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

	function setNextCurrentPatternIndex() {
		if (currentPatternIndex === 15) {
			currentPatternIndex = 0;
		} else {
			currentPatternIndex += 1;
		}
	}

	function changeBpm(newBpm) {
		if (newBpm) {
			bpm = newBpm;
		} else {
			bpm = tempoSlider.value;
		}
		calculateSixteenthNote();
	}

	function resetDrumMachine() {
		for (const sequencerModule of sequencerModules) {
			sequencerModule.removeActiveClass();
		}
		
		currentPatternIndex = 0;
	}

	function applyNewDrumPattern(pattern) {
		for (let index = 0; index < patterns.housePattern.length; index += 1) {
			const sequencerModule = sequencerModules[index];
			sequencerModule.changePattern(pattern[index]); 
			sequencerModule.renderHtml();
		}
	}

	function loadNewSamplesToBuffer(genre) {
		switch(genre) {
			case 'house':
				samplePaths = HouseSamples;
				break
			case 'hiphop':
				samplePaths = hiphopSamples;
				break
			case 'acoustic':
				samplePaths = acousticSamples;
				break
		}

		for (const sequencerModule of sequencerModules) {
			sequencerModule.loadAudioIntoBuffer(audioContext, samplePaths);
		}

		selectSamples.value = genre;
	}

	function toggleExtremeTempo() {
		if (isExtremeTempo) {
			tempoSlider.setAttribute('max', 10000);
		} else {
			tempoSlider.setAttribute('max', 200);
		}
	}

	function renderHtml() {
		renderPlayPauseIcon();
		renderBpm();
	}

	function renderBpm() {
		tempoSlider.value = bpm;
		tempoDisplay.innerText = bpm;
	}

	function renderPlayPauseIcon() {
		if (isPlaying) {
			playButtonIcon.src = "/assets/svg/pause.svg";
		} else {
			playButtonIcon.src = '/assets/svg/play.svg';
		}
	}

	function renderExtremeButton() {
		if (isExtremeTempo) {
			extremeButton.classList.add('drum-machine__tempo-extreme-button--active');
		} else {
			extremeButton.classList.remove('drum-machine__tempo-extreme-button--active');
		}
	}

	// Called methods
	for (const sequencerModule of sequencerModules) {
		sequencerModule.loadAudioIntoBuffer(audioContext, samplePaths);
	}

	renderHtml();
	calculateSixteenthNote();
	applyNewDrumPattern(patterns.housePattern);
}
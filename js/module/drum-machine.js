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
	const drumMachine = {
		bpm : 120,
		isPlaying : false, 
		isExtremeTempo : false,
		currentPatternIndex : 0,

		sixteenthNoteInMilliseconds: null,
		eighthNoteInMilliseconds: null,
		quarterNoteInMilliseconds: null,

		currentDivision: null,
	}

	const clearPatternButton = document.querySelector('.drum-machine__clear-button');
	clearPatternButton.addEventListener('click', handleClearPatternButton);

	function handleClearPatternButton() {
		applyNewDrumPattern(patterns.clearPattern);
	}

	const HouseSamples = ['/assets/audio/house/hihat.mp3', '/assets/audio/house/perc.mp3', '/assets/audio/house/snare.mp3', '/assets/audio/house/kick.mp3'];
	const hiphopSamples = ['/assets/audio/hiphop/hihat.mp3', '/assets/audio/hiphop/perc.mp3', '/assets/audio/hiphop/snare.mp3', '/assets/audio/hiphop/kick.mp3'];
	const acousticSamples = ['/assets/audio/acoustic/hihat.mp3', '/assets/audio/acoustic/perc.mp3', '/assets/audio/acoustic/snare.mp3', '/assets/audio/acoustic/kick.mp3'];
	let samplePaths;

	const audioContext = new AudioContext();
	const lookahead = 25.0; 
	const scheduleAheadTime = 0.1; 
	let timerID;
	let triggerID;
	let nextTriggerTime = 0 

	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');
	const playButtonIcon = document.querySelector('.drum-machine__play-button-icon');
	const tempoSlider = document.querySelector('.drum-machine__tempo-slider');
	const tempoDisplay = document.querySelector('.drum-machine__tempo-display');
	const selectSamples = document.querySelector('.drum-machine__select-samples');
	const selectPattern = document.querySelector('.drum-machine__select-pattern');
	const selectDivision = document.querySelector('.drum-machine__select-division')
	const extremeButton = document.querySelector('.drum-machine__tempo-extreme-button');

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);
	tempoSlider.addEventListener('input', handleTempoSliderChange);
	selectSamples.addEventListener('change', handleSelectSamplesChange);
	selectPattern.addEventListener('change', handleSelectPatternChange);
	selectDivision.addEventListener('change', handleSelectDivisionChange);
	extremeButton.addEventListener('click', handleExtremeButtonClick);

	// Handlers	
	function handlePlayButtonClick() {
		toggleIsPlaying();
		toggleSequence();	
		if (!drumMachine.isPlaying) {
			resetDrumMachine();
		}
		renderHtml();
	}

	function handleTempoSliderChange() {
		changeBpm();
		setDivision();
		renderHtml();
	}

	function handleSelectPatternChange() {
		const genre = selectPattern.value;
		const [newPattern, newBpm] = returnFetchPattern(genre);
		applyNewDrumPattern(newPattern);
		changeBpm(newBpm);
		setDivision();
		loadSamplesToBuffer(genre);
		renderHtml();
	}

	function handleSelectSamplesChange() {
		loadSamplesToBuffer(selectSamples.value);
	}

	function handleSelectDivisionChange() {
		setDivision();
	}

	function handleExtremeButtonClick() {
		drumMachine.isExtremeTempo = !drumMachine.isExtremeTempo;
		toggleExtremeTempo();

		if (!drumMachine.isExtremeTempo) {
			changeBpm(120);
			setDivision();
		}

		renderHtml();
	}
 
	//Methods
	function storeUserPattern() {
		// window.
	}


	function toggleIsPlaying () {
		drumMachine.isPlaying = !drumMachine.isPlaying;

		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleIsPlaying();
		}
	}

	function calculateNoteDivisions() {
		drumMachine.quarterNoteInMilliseconds = (60 / drumMachine.bpm) * 1000;
		drumMachine.eighthNoteInMilliseconds = drumMachine.quarterNoteInMilliseconds / 2;
		drumMachine.sixteenthNoteInMilliseconds = drumMachine.quarterNoteInMilliseconds / 4;
	}

	function returnFetchPattern(genre) {
		let newPattern;
		let newBpm;

		switch(genre) {
			case 'house':
				newPattern = patterns.housePattern;
				newBpm = 120;
				return [newPattern, newBpm]
			case 'hiphop':
				newPattern = patterns.hiphopPattern;
				newBpm = 140;
				return [newPattern, newBpm]
			case 'acoustic':
				newPattern = patterns.acousticPattern;
				newBpm = 110;
				return [newPattern, newBpm]
		}
	}

	function setDivision() {
		switch(selectDivision.value) {
			case '4':
				drumMachine.currentDivision = drumMachine.quarterNoteInMilliseconds;
				break
			case '8':
				drumMachine.currentDivision = drumMachine.eighthNoteInMilliseconds;
				break
			case '16':
				drumMachine.currentDivision = drumMachine.sixteenthNoteInMilliseconds;
				break
		}
	}

	function loadSamplesToBuffer(genre) {
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

	function scheduler() {	
		if (nextTriggerTime === 0) {
			nextTriggerTime = audioContext.currentTime;
		}

		while (nextTriggerTime < audioContext.currentTime + scheduleAheadTime) {
			for (const sequencerModule of sequencerModules) {
				if (sequencerModule.pattern[drumMachine.currentPatternIndex]) {
					sequencerModule.scheduleSample(audioContext, nextTriggerTime);
				}
			}
			
			triggerID = setTimeout(scheduleToggleActiveClass(drumMachine.currentPatternIndex), scheduleAheadTime);
			nextTriggerTime += (drumMachine.currentDivision / 1000); 
			setNextCurrentPatternIndex();
		}

		timerID = setTimeout(scheduler, lookahead);
	}

	function scheduleToggleActiveClass(currentPatternIndex) {
		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleActiveClass(drumMachine.currentPatternIndex);
		}
	}

	function toggleSequence() {
		if (drumMachine.isPlaying) {
			audioContext.resume();
			scheduler();

		} else {
			audioContext.suspend();
			clearInterval(timerID);
		}
	}

	function setNextCurrentPatternIndex() {
		if (drumMachine.currentPatternIndex === 15) {
			drumMachine.currentPatternIndex = 0;
		} else {
			drumMachine.currentPatternIndex += 1;
		}
	}

	function changeBpm(newBpm) {
		if (newBpm) {
			drumMachine.bpm = newBpm;
		} else {
			drumMachine.bpm = tempoSlider.value;
		}
		calculateNoteDivisions();
	}

	function resetDrumMachine() {
		for (const sequencerModule of sequencerModules) {
			sequencerModule.removeActiveClass();
		}
		
		drumMachine.currentPatternIndex = 0;
	}

	function applyNewDrumPattern(pattern) {
		for (let index = 0; index < patterns.housePattern.length; index += 1) {
			const sequencerModule = sequencerModules[index];
			sequencerModule.changePattern(pattern[index]); 
			sequencerModule.renderHtml();
		}
	}

	function toggleExtremeTempo() {
		if (drumMachine.isExtremeTempo) {
			tempoSlider.setAttribute('max', 10000);
		} else {
			tempoSlider.setAttribute('max', 200);
		}
	}

	// All View Renders
	function renderHtml() {
		renderPlayPauseIcon();
		renderBpm();
		renderExtremeButton();
	}

	function renderBpm() {
		tempoSlider.value = drumMachine.bpm;
		tempoDisplay.innerText = drumMachine.bpm;
	}

	function renderPlayPauseIcon() {
		if (drumMachine.isPlaying) {
			playButtonIcon.src = "/assets/svg/pause.svg";
		} else {
			playButtonIcon.src = '/assets/svg/play.svg';
		}
	}

	function renderExtremeButton() {
		if (drumMachine.isExtremeTempo) {
			extremeButton.classList.add('drum-machine__tempo-extreme-button--active');
		} else {
			extremeButton.classList.remove('drum-machine__tempo-extreme-button--active');
		}
	}

	// Called methods
	loadSamplesToBuffer(selectSamples.value)

	for (const sequencerModule of sequencerModules) {
		sequencerModule.loadAudioIntoBuffer(audioContext, samplePaths);
	}

	calculateNoteDivisions();
	setDivision();
	renderHtml();
}
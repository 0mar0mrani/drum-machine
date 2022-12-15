import Sequencer from './drum-machine-modules/sequencer.js';
import Patterns from './drum-machine-modules/patterns.js';

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
		audioContext : new AudioContext(),
		bpm : 120,
		isPlaying : false, 
		isExtremeTempo : false,
		currentPatternIndex : 0,
		sixteenthNoteInMilliseconds: null,
		timeSignature: null,
		samples: null,

		timing: {
			timerID: null,
			triggerID: null,
			lookahead : 25.0, 
			scheduleAheadTime : 0.1, 
			nextTriggerTime : 0, 
		},
	}

	const HouseSamples = ['/assets/audio/house/hihat.mp3', '/assets/audio/house/perc.mp3', '/assets/audio/house/snare.mp3', '/assets/audio/house/kick.mp3'];
	const hiphopSamples = ['/assets/audio/hiphop/hihat.mp3', '/assets/audio/hiphop/perc.mp3', '/assets/audio/hiphop/snare.mp3', '/assets/audio/hiphop/kick.mp3'];
	const acousticSamples = ['/assets/audio/acoustic/hihat.mp3', '/assets/audio/acoustic/perc.mp3', '/assets/audio/acoustic/snare.mp3', '/assets/audio/acoustic/kick.mp3'];


	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');
	const playButtonIcon = document.querySelector('.drum-machine__play-button-icon');
	const clearPatternButton = document.querySelector('.drum-machine__clear-button');
	const savePattern = document.querySelector('.drum-machine__save-button');
	const tempoSlider = document.querySelector('.drum-machine__tempo-slider');
	const tempoDisplay = document.querySelector('.drum-machine__tempo-display');
	const selectSamples = document.querySelector('.drum-machine__select-samples');
	const selectPattern = document.querySelector('.drum-machine__select-pattern');
	const selectDivision = document.querySelector('.drum-machine__select-division')
	const extremeButton = document.querySelector('.drum-machine__tempo-extreme-button');

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);
	clearPatternButton.addEventListener('click', handleClearPatternButton);
	savePattern.addEventListener('click', handleSavePatternButton);
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
		renderHtml();
	}

	function handleSelectPatternChange() {
		const genre = selectPattern.value;
		const [newPattern, newBpm] = returnFetchPattern(genre);
		applyNewDrumPattern(newPattern);
		changeBpm(newBpm);
		if (genre !== 'user') {
			loadSamplesToBuffer(genre);
		}
		renderHtml();
	}

	function handleSelectSamplesChange() {
		loadSamplesToBuffer(selectSamples.value);
	}

	function handleSelectDivisionChange() {
		setTimeSignature();
		renderHtml();
	}

	function handleExtremeButtonClick() {
		drumMachine.isExtremeTempo = !drumMachine.isExtremeTempo;
		toggleExtremeTempo();
		if (!drumMachine.isExtremeTempo) {
			changeBpm(120);
		}
		renderHtml();
	}

	function handleClearPatternButton() {
		applyNewDrumPattern(patterns.clearPattern);
	}

	function handleSavePatternButton() {
		saveUserPattern();
		storeLocalUserPattern();
	}
 
	//Methods
	function saveUserPattern() {
		const fullPattern = []

		for (const sequencerModule of sequencerModules) {
			const sequencerPattern = []

			for (const step of sequencerModule.sequencer.pattern) {
				sequencerPattern.push(step);
			}

			fullPattern.push(sequencerPattern)
		}

		patterns.userPattern = fullPattern;
	}

	function storeLocalUserPattern() {
		const userPattern = patterns.userPattern;
		const serializedPattern = JSON.stringify(userPattern);
		window.localStorage.setItem('userPatternLocal', serializedPattern);
	}

	function getLocalUserPattern() {
		const localUserPattern = window.localStorage.getItem('userPatternLocal');
		const parsedLocalPattern = JSON.parse(localUserPattern);

		if (localUserPattern) {
			patterns.userPattern = parsedLocalPattern;
		} 
	}

	function toggleIsPlaying () {
		drumMachine.isPlaying = !drumMachine.isPlaying;

		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleIsPlaying();
		}
	}

	function setTimeSignature() {
		const timeSignature = selectDivision.value
		drumMachine.timeSignature = timeSignature;

		for (const sequencerModule of sequencerModules) {
			sequencerModule.setTimeSignature(timeSignature);
		}
	}

	function calculateSixteenthNoteInMilliseconds() {
		const quarterNoteInMilliseconds = (60 / drumMachine.bpm) * 1000;
		drumMachine.sixteenthNoteInMilliseconds = quarterNoteInMilliseconds / 4;
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
			case 'user':
				newPattern = patterns.userPattern;
				newBpm = 120;
				return [newPattern, newBpm];
		}
	}

	function loadSamplesToBuffer(genre) {
		switch(genre) {
			case 'house':
				drumMachine.samples = HouseSamples;
				break
			case 'hiphop':
				drumMachine.samples = hiphopSamples;
				break
			case 'acoustic':
				drumMachine.samples = acousticSamples;
				break
		}

		for (const sequencerModule of sequencerModules) {
			sequencerModule.loadAudioIntoBuffer(drumMachine.audioContext, drumMachine.samples);
		}

		selectSamples.value = genre;
	}

	function scheduler() {	
		if (drumMachine.timing.nextTriggerTime === 0) {
			drumMachine.timing.nextTriggerTime = drumMachine.audioContext.currentTime;
		}

		while (drumMachine.timing.nextTriggerTime < drumMachine.audioContext.currentTime + drumMachine.timing.scheduleAheadTime) {
			for (const sequencerModule of sequencerModules) {
				if (sequencerModule.sequencer.pattern[drumMachine.currentPatternIndex]) {
					sequencerModule.scheduleSample(drumMachine.audioContext, drumMachine.timing.nextTriggerTime);
				}
			}
			
			drumMachine.timing.triggerID = setTimeout(scheduleToggleActiveClass(drumMachine.currentPatternIndex), drumMachine.timing.scheduleAheadTime);
			drumMachine.timing.nextTriggerTime += (drumMachine.sixteenthNoteInMilliseconds / 1000); 
			setNextCurrentPatternIndex();
		}

		drumMachine.timing.timerID = setTimeout(scheduler, drumMachine.timing.lookahead);
	}

	function scheduleToggleActiveClass(currentPatternIndex) {
		for (const sequencerModule of sequencerModules) {
			sequencerModule.toggleActiveClass(drumMachine.currentPatternIndex);
		}
	}

	function toggleSequence() {
		if (drumMachine.isPlaying) {
			drumMachine.audioContext.resume();
			scheduler();

		} else {
			drumMachine.audioContext.suspend();
			clearInterval(drumMachine.timerID);
		}
	}

	function setNextCurrentPatternIndex() {
		if (drumMachine.timeSignature === '3/4') {
			if (drumMachine.currentPatternIndex >= 11) {
				drumMachine.currentPatternIndex = 0;
			} else {
				drumMachine.currentPatternIndex += 1;
			}

		} else {
			if (drumMachine.currentPatternIndex >= 15) {
				drumMachine.currentPatternIndex = 0;
			} else {
				drumMachine.currentPatternIndex += 1;
			}
		}
	}

	function changeBpm(newBpm) {
		if (newBpm) {
			drumMachine.bpm = newBpm;
		} else {
			drumMachine.bpm = tempoSlider.value;
		}
		calculateSixteenthNoteInMilliseconds();
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
			tempoSlider.setAttribute('max', 9999);
		} else {
			tempoSlider.setAttribute('max', 200);
		}
	}

	// All View Renders
	function renderHtml() {
		renderPlayPauseIcon();
		renderBpm();
		renderExtremeButton();

		for (let index = 0; index < sequencerModules.length; index += 1) {
			const sequencerModule = sequencerModules[index];
			sequencerModule.renderHtml();
		}
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
		sequencerModule.loadAudioIntoBuffer(drumMachine.audioContext, drumMachine.samples);
	}

	setTimeSignature();
	calculateSixteenthNoteInMilliseconds();
	getLocalUserPattern();
	renderHtml();
}
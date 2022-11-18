export default function DrumMachine() {
	// Data

	const bpm = 120;
	const bpmInMilliseconds = (60 / bpm) * 1000;
	const sixteenthNoteInMilliseconds = bpmInMilliseconds / 4;

	const pattern = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false,];
	let currentPatternIndex = 0;
	let isPlaying = false; 

	const samplePaths = ['/assets/audio/kick.wav']
	let samples;
	let timerID;
	let triggerID;
	const audioContext = new AudioContext();

	const lookahead = 25.0; 
	const scheduleAheadTime = 0.1; 
	let nextTriggerTime = 0 

	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');
	const sequencerSteps = document.querySelectorAll('.drum-machine__sequencer-step');
	const sample0Button = document.querySelector('.drum-machine__sequencer-sample');

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);
	sample0Button.addEventListener('click', handleSample0ButtonClick);

	for (let index = 0; index < sequencerSteps.length; index += 1) {
		sequencerSteps[index].addEventListener('click', () => {
			handleSequencerStepsClick(event, index);
		})
	}

	// Handlers
	function handleSequencerStepsClick(event, index) {
		pattern[index] = !pattern[index];
		scheduleSample(samples[0]);
		renderHTML()
	}
	
	function handlePlayButtonClick() {
		toggleIsPlaying();
		toggleSequence();
		
		if (!isPlaying) {
			resetDrumMachine();
		}
	}

	function handleSample0ButtonClick() {
		audioContext.resume();
		scheduleSample(samples[0])
	}
 
	//Methods
	function loadAudioIntoBuffer() {		
		setupSamples(samplePaths).then((response) => {
			samples = response;
		})
	}

	async function getFile(filePath) {
		const response = await fetch(filePath);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
		return audioBuffer;
	} 

	async function setupSamples(paths) {
		const audioBuffers = [];

		for (const path of paths) {
			const sample = await getFile(path)
			audioBuffers.push(sample)
		}
		return audioBuffers;
	}

	function scheduleSample(audioBuffer, time) {
		const sampleSource = audioContext.createBufferSource();
		sampleSource.buffer = audioBuffer;
		sampleSource.connect(audioContext.destination);
		sampleSource.start(time);
	}

	function toggleIsPlaying () {
		isPlaying = !isPlaying;
	}

	function scheduler() {	
		if (nextTriggerTime === 0) {
			nextTriggerTime = audioContext.currentTime;
		}

		while (nextTriggerTime < audioContext.currentTime + scheduleAheadTime) {
			if (pattern[currentPatternIndex]) {
				scheduleSample(samples[0], nextTriggerTime);
			}

			triggerID = setTimeout(scheduleToggleActiveClass, scheduleAheadTime);
			nextTriggerTime += (sixteenthNoteInMilliseconds / 1000); 
			setNextPatternIndex();
		}

		timerID = setTimeout(scheduler, lookahead);
	}

	function scheduleToggleActiveClass() {
		toggleActiveClass();
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

	function toggleActiveClass() {
		for (const step of sequencerSteps) {
			step.classList.remove('drum-machine__sequencer-play-head');
		}

		sequencerSteps[currentPatternIndex].classList.add('drum-machine__sequencer-play-head');
	}

	function setNextPatternIndex() {
		if (currentPatternIndex === 15) {
			currentPatternIndex = 0;
		} else {
			currentPatternIndex += 1;
		}
	}
	
	function resetDrumMachine() {
		for (const step of sequencerSteps) {
			step.classList.remove('drum-machine__sequencer-play-head');
		}

		currentPatternIndex = 0;
	}

	function renderHTML() {
		renderSequence();
	}

	function renderSequence() {
		for (let index = 0; index < pattern.length; index += 1) {
			if (pattern[index]) {
				sequencerSteps[index].classList.add('drum-machine__step--active')
			} else {
				sequencerSteps[index].classList.remove('drum-machine__step--active')
			}
		}
	}

	// Called methods
	loadAudioIntoBuffer();
	renderHTML();
}
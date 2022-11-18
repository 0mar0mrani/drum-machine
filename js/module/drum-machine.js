export default function DrumMachine() {
	// Data
	const bpm = 120;
	const bpmInMilliseconds = (60 / bpm) * 1000;
	const sixteenthNoteInMilliseconds = bpmInMilliseconds / 4

	const pattern = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false,];
	let currentPatternIndex = 0;
	let currentPatternIndexVisual = 0;
	let isPlaying = false; 
	let sampleInterval;

	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');
	const sequencerSteps = document.querySelectorAll('.drum-machine__sequencer-step');
	const sample0 = document.querySelector('.drum-machine__sequencer-sample');

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);
	window.addEventListener('keydown', handleWindowKeydown);
	// resetButton.addEventListener('click', handleResetButtonClick);

	for (let index = 0; index < sequencerSteps.length; index += 1) {
		sequencerSteps[index].addEventListener('click', () => {
			handleSequencerStepsClick(event, index);
		})
	}

	// Handlers
	function handleSequencerStepsClick(event, index) {
		pattern[index] = !pattern[index];
		renderSequence()
	}
	
	function handlePlayButtonClick() {
		toggleIsPlaying();
		toggleSequence();
	}

	function handleWindowKeydown(event) {
		if (event.key === ' ') {
			toggleIsPlaying();
			toggleSequence(); 
		}
	}
 
	//Functions
	function toggleIsPlaying () {
		isPlaying = !isPlaying;
	}

	sample0.addEventListener('click', handleSample0Click);

	function handleSample0Click() {
		audioContext.resume();
		queueSample(samples[0], audioContext.currentTime)
	}
	
	const samplePaths = ['/assets/audio/kick.wav']
	let samples;
	let timerID;
	let audioContext;

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

	function setup() {
		audioContext = new AudioContext();
		
		setupSamples(samplePaths).then((response) => {
			samples = response;
		})
	}

	function queueSample(audioBuffer, time) {
		const sampleSource = audioContext.createBufferSource();
		sampleSource.buffer = audioBuffer;
		sampleSource.connect(audioContext.destination);
		sampleSource.start(time)
	}

	const lookahead = 25.0; 
	const scheduleAheadTime = 0.1; 
	let nextTriggerTime = 0 // seconds
	let triggerID = null;

	function scheduler() {	
		if (nextTriggerTime === 0) {
			nextTriggerTime = audioContext.currentTime;
		}

		while (nextTriggerTime < audioContext.currentTime + scheduleAheadTime) {
			if (pattern[currentPatternIndex]) {
				queueSample(samples[0], nextTriggerTime);
			}

			triggerID = setTimeout(trigger, scheduleAheadTime);
			
			nextTriggerTime += (sixteenthNoteInMilliseconds / 1000); 
			setNextPatternIndex();
		}

		timerID = setTimeout(scheduler, lookahead);
	}

	function trigger() {
		toggleActiveClass();
		setNextPatternIndexVisual();
	}

	function toggleSequence() {
		if (isPlaying) {
			audioContext.resume();
			scheduler();

		} else {
			audioContext.suspend();
			clearInterval(timerID);
			resetDrumMachine();
		}
	}

	function toggleActiveClass() {
		for (const step of sequencerSteps) {
			step.classList.remove('drum-machine__sequencer-play-head');
		}

		sequencerSteps[currentPatternIndexVisual].classList.add('drum-machine__sequencer-play-head');
	}

	function setNextPatternIndex() {
		if (currentPatternIndex === 15) {
			currentPatternIndex = 0;
		} else {
			currentPatternIndex += 1;
		}
	}

	function setNextPatternIndexVisual()  {
		if (currentPatternIndexVisual === 15) {
			currentPatternIndexVisual = 0;
		} else {
			currentPatternIndexVisual += 1;
		}
	}
	
	function resetDrumMachine() {
		for (const step of sequencerSteps) {
			step.classList.remove('drum-machine__checkbox--active');
		}

		currentPatternIndex = 0;
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
	setup();
	renderSequence();
}
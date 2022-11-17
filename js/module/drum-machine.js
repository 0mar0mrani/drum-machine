export default function DrumMachine() {
	// Data
	const bpm = 120;
	const bpmInMilliseconds = (60 / bpm) * 1000;
	const sixteenthNoteInMilliseconds = bpmInMilliseconds / 4

	const pattern = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,]
	let currentPatternIndex = 0
	let isPlaying = false; 
	let sampleInterval;

	// QuerrySelectors
	const playButton = document.querySelector('.drum-machine__play-button');
	const resetButton = document.querySelector('.drum-machine__reset-button');
	const checkBoxes = document.querySelectorAll('.drum-machine__checkbox');

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick);
	window.addEventListener('keydown', handleWindowKeydown);
	resetButton.addEventListener('click', handleResetButtonClick);

	for (let index = 0; index < checkBoxes.length; index += 1) {
		checkBoxes[index].addEventListener('change', () => {
			handleCheckboxChange(event, index);
		})
	}

	// Handlers
	function handleCheckboxChange(event, index) {
		pattern[index] = !pattern[index];
	}
	
	function handlePlayButtonClick() {
		toggleIsPlaying();
		playSample();
	}

	function handleWindowKeydown(event) {
		if (event.key === ' ') {
			toggleIsPlaying();
			playSample(); 
		}
	}

	function handleResetButtonClick() {
		removeFullPattern();
	}
 
	//Functions
	function toggleIsPlaying () {
		isPlaying = !isPlaying;
	}

	const importButton = document.querySelector('.drum-machine__import-button');
	const triggerButton = document.querySelector('.drum-machine__trigger-button');
	importButton.addEventListener('click', handleImportButtonClick);
	triggerButton.addEventListener('click', handleTriggerButtonClick);
	
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
		console.log('Setting up samples');
		const audioBuffers = [];

		for (const path of paths) {
			const sample = await getFile(path)
			audioBuffers.push(sample)
		}

		console.log('setting up done');

		return audioBuffers;
	}

	function handleImportButtonClick() {
		audioContext = new AudioContext();
		
		setupSamples(samplePaths).then((response) => {
			samples = response;
			console.log(samples);
		})
	}

	function handleTriggerButtonClick() {
		queueSample(samples[0], audioContext.currentTime);

		console.log(audioContext.currentTime);
	}

	function queueSample(audioBuffer, time) {
		const sampleSource = audioContext.createBufferSource();
		sampleSource.buffer = audioBuffer;
		sampleSource.connect(audioContext.destination);
		sampleSource.start(time)
	}

	const lookahead = 25.0; 
	const scheduleAheadTime = 0.5; 
	let nextTriggerTime = 0 // seconds

	function scheduler() {
		if (nextTriggerTime === 0) {
			nextTriggerTime = audioContext.currentTime;
		}
		
		while (nextTriggerTime < audioContext.currentTime + scheduleAheadTime) {
			if (pattern[currentPatternIndex]) {
				queueSample(samples[0], nextTriggerTime);
			}

			nextTriggerTime += (sixteenthNoteInMilliseconds / 1000); 
			setNextPatternIndex();
		}

		timerID = setTimeout(scheduler, lookahead)
	}

	function playSample() {
		if (isPlaying) {
			scheduler();

		} else {
			clearInterval(sampleInterval);
			resetDrumMachine();
		}
	}

	function toggleActiveClass() {
		for (const checkBox of checkBoxes) {
			checkBox.classList.remove('drum-machine__checkbox--active');
		}

		checkBoxes[currentPatternIndex].classList.add('drum-machine__checkbox--active')
	}

	function setNextPatternIndex() {
		if (currentPatternIndex === 15) {
			currentPatternIndex = 0;
		} else {
			currentPatternIndex += 1;
		}
	}

	function resetDrumMachine() {
		for (const checkBox of checkBoxes) {
			checkBox.classList.remove('drum-machine__checkbox--active');
		}

		currentPatternIndex = 0;
	} 

	function removeFullPattern() {
		for (let index = 0; index < checkBoxes.length; index += 1) {
			pattern[index] = false;
			checkBoxes[index].checked = false;
		}
	}

	function renderSequence() {
		for (let index = 0; index < pattern.length; index += 1) {

			if (pattern[index]) {
				checkBoxes[index].checked = true
			}
		}
	}

	renderSequence();
}
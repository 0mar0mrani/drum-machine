export default function Sequencer(sequencerNode, index) {
	const sequencer = {
		samples: null,
		rightSampleIndex : index,
		isPlaying : false,
	   timeSignature : null,	
	}
	const pattern = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,];

	const sequencerSteps = sequencerNode.querySelectorAll('.drum-machine__sequencer-step');

	for (let index = 0; index < sequencerSteps.length; index += 1) {
		sequencerSteps[index].addEventListener('click', () => {
			handleSequencerStepsClick(event, index);
		})
	}

	function loadAudioIntoBuffer(audioContext, samplePaths) {	
		setupSamples(audioContext, samplePaths).then((response) => {
			sequencer.samples = response;
		})
	}

	function handleSequencerStepsClick(event, index) {
		pattern[index] = !pattern[index];
		renderHtml()
	}

	function toggleIsPlaying() {
		sequencer.isPlaying = !sequencer.isPlaying;
	}

	function toggleActiveClass(currentPatternIndex) {
		removeActiveClass();

		sequencerSteps[currentPatternIndex].classList.add('drum-machine__sequencer-play-head');
	}

	function removeActiveClass() {
		for (const step of sequencerSteps) {
			step.classList.remove('drum-machine__sequencer-play-head');
		}
	}

	async function setupSamples(audioContext, paths) {
		const audioBuffers = [];

		for (const path of paths) {
			const sample = await getFile(audioContext, path)
			audioBuffers.push(sample)
		}
		return audioBuffers;
	}

	async function getFile(audioContext, filePath) {
		const response = await fetch(filePath);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
		return audioBuffer;
	} 

	function scheduleSample(audioContext, time) {
		const sampleSource = audioContext.createBufferSource();
		sampleSource.buffer = samples[sequencer.rightSampleIndex];
		sampleSource.connect(audioContext.destination);
		sampleSource.start(time);
	}

	function changePattern(newPattern) {
		for (let index = 0; index < pattern.length; index += 1) {
			pattern[index] = newPattern[index];
		}
	}

	function setTimeSignature(signature) {
		sequencer.timeSignature = signature;
	}

	function renderHtml() {
		renderSequence();
		renderTimeSignature();
	}

	function renderTimeSignature() {
		if (sequencer.timeSignature === '3/4') {
			for (let index = 12; index < pattern.length; index += 1) {
				sequencerSteps[index].classList.add('drum-machine__step--deactivated')
			}
			
		} else {
			for (let index = 0; index < pattern.length; index += 1) {
				sequencerSteps[index].classList.remove('drum-machine__step--deactivated')
			}
		}
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

	return {
		loadAudioIntoBuffer,
		scheduleSample,
		pattern,
		toggleActiveClass,
		removeActiveClass,
		toggleIsPlaying,
		renderHtml,
		changePattern,
		setTimeSignature,
	}
}
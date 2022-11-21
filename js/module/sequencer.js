export default function Sequencer(sequencerNode, index) {
	let samples;
	let rightSampleIndex = index;
	let isPlaying = false;

	const pattern = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,];

	const sequencerSteps = sequencerNode.querySelectorAll('.drum-machine__sequencer-step');

	for (let index = 0; index < sequencerSteps.length; index += 1) {
		sequencerSteps[index].addEventListener('click', () => {
			handleSequencerStepsClick(event, index);
		})
	}

	function loadAudioIntoBuffer(audioContext, samplePaths) {	
		setupSamples(audioContext, samplePaths).then((response) => {
			samples = response;
		})
	}

	function handleSequencerStepsClick(event, index) {
		pattern[index] = !pattern[index];
		renderHtml()
	}

	function toggleIsPlaying() {
		isPlaying = !isPlaying;
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
		sampleSource.buffer = samples[rightSampleIndex];
		sampleSource.connect(audioContext.destination);
		sampleSource.start(time);
	}

	function changePattern(newPattern) {
		for (let index = 0; index < pattern.length; index += 1) {
			pattern[index] = newPattern[index];
		}
	}

	function renderHtml() {
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

	renderHtml();

	return {
		loadAudioIntoBuffer,
		scheduleSample,
		pattern,
		toggleActiveClass,
		removeActiveClass,
		toggleIsPlaying,
		renderHtml,
		changePattern,
	}
}
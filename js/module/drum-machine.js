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
	const checkBoxes = document.querySelectorAll('.drum-machine__checkbox')

	// Eventlisteners
	playButton.addEventListener('click', handlePlayButtonClick)

	for (let index = 0; index < checkBoxes.length; index += 1) {
		checkBoxes[index].addEventListener('change', () => {
			handleCheckboxChange(event, index);
		})
	}

	// Methods
	function handleCheckboxChange(event, index) {
		pattern[index] = !pattern[index];
		console.log(pattern);
	}
	
	function handlePlayButtonClick() {
		isPlaying = !isPlaying;

		toggleKickPattern();
	}

	function toggleKickPattern() {
		if (isPlaying) {
			sampleInterval = setInterval(function() {
				if (pattern[currentPatternIndex]) {
					const kick = new Audio('/assets/audio/kick.wav'); 
					kick.play()
				} 
				
				console.log(`Current index is ${currentPatternIndex}`);

				if (currentPatternIndex === 15) {
					currentPatternIndex = 0;
				} else {
					currentPatternIndex += 1;
				}

			}, sixteenthNoteInMilliseconds) 

		} else {
			clearInterval(sampleInterval)
		}
	}
}
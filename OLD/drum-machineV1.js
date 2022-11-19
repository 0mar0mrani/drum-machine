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



	function playSample() {
		 if (isPlaying) {
			let totalTime = 0;
			let startTime = Date.now();

			let difference = 0;
			
			sampleInterval = setInterval(function() {
				if (pattern[currentPatternIndex]) {
					const kick = new Audio('/assets/audio/kick.wav'); 
					kick.play()
				}

				totalTime += sixteenthNoteInMilliseconds;
				let elapsedTime = Date.now() - startTime;

				difference += elapsedTime - totalTime;

				// console.log('total drift', elapsedTime - totalTime);

				console.log(difference);

				toggleActiveClass();

				setNextPatternIndex();

			}, sixteenthNoteInMilliseconds) 

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
}
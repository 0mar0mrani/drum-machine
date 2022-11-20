export default function Patterns() {
	const housePattern = [
		[false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Hihat
		[false, false, false, true, false, false, true, false, false, false, false, false, false, false, false, false], // Perc
		[false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
		[true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
	]
	
	const hiphopPattern = [
		[true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // Hihat
		[false, false, true, false, false, false, false, false, false, false, false, false, false, false, true, false], // Perc
		[false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // Snare
		[true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false], // Kick
	]
	
	const acousticPattern = [
		[true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], // Hihat
		[false, false, false, false, false, false, false, false, false, true, false, false, true, false, false, true], // Perc
		[false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
		[true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], // Kick
	]

	return {
		housePattern,
		hiphopPattern,
		acousticPattern,
	}
}
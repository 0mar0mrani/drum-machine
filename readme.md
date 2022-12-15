# Drum Machine
This is a drum machine where you can sequence patterns 4 different tracks. It's built with vanilla JavaScript, css and HTML. 

## About
JavaScript and its Audio API can be a bit hard to work with when it comes to timing - but I wanted to challenge myself and not use libraries such as [tone.js](https://tonejs.github.io).

The drum machine is made by using an advanced technic where you use 'currentTime' to specify when to play the samples, as it's superior when it comes to timing compared to 'setInterval'. There's no timing issues and it's accuracy is even more apparent when using 'Extreme tempo', as it turns into an oscillator with a steady pitch. Each row/track is a module that is being reused - that way it's easy to implement more tracks if i wanted. 

## Features
- No Timing issues, this drum machine is on beat.
- Clear pattern.
- Save patterns to local storage, you'll find the saved pattern at 'User Pattern'.
- Select from predefined patterns.
- Select drum kits.
- Choose between time signature 4/4 and 3/4.
- Choose tempo/BPM (and 'Extreme Tempo').
- Emulating the look of modern hardware. 
- Responsive design.
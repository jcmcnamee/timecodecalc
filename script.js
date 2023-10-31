const smpteInput = document.getElementById('tcInput');
const buttons = document.querySelectorAll('.btn');
const keypad = document.getElementById('keypad');
console.log(buttons);

document.addEventListener('keydown', function (e) {
  const timecodeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d:[0-2]\d$/;

  if (e.key === 'Enter') {
    if (timecodeRegex.test(smpteInput.value)) {
      console.log('valid input');
    } else {
      console.log('invalid input');
    }
  }
});

keypad.addEventListener('click', function (e) {
  // Buttons update the smpteInput and then trigger
  // the event from there to use the input logic.
  // Update input UI:
  smpteInput.value += e.target.innerHTML;

  // Create a new 'input' event.
  const inputEvent = new Event('input');

  // Trigger event
  smpteInput.dispatchEvent(inputEvent);
});

smpteInput.addEventListener('input', userInput);

function userInput(e) {
  console.log('event triggered!');
  // Store value and remove any non-numerical characters and update.
  const value = e.target.value.replace(/[^0-9]/g, '');
  // Initialise output
  let formattedVal = '';
  // Loop over the string
  if (value.length > 0) {
    // Loop over string
    for (let i = 0; i < value.length; i++) {
      // If time for a colon add it
      if (i === 2 || i === 4 || i === 6) {
        formattedVal += ':';
      }
      // Add value from event to output string
      formattedVal += value[i];
    }
    // Prevent input over 11 characters
    if (formattedVal.length > 11) {
      formattedVal = formattedVal.slice(0, 11);
    }
  }
  // Update UI
  smpteInput.value = formattedVal;
}

const buttons = document.querySelectorAll('.btn');
const keypad = document.getElementById('keypad');
const display = document.getElementById('screen-panel');

console.log(buttons);

class Calculator {
  constructor() {
    this.fps = 25;
    this.stack = [];
    this.mode = 'timecode';
    this.input = document.getElementById('tcInput');

    this.inputHandler = this.inputHandler.bind(this);
    this.keyHandler = this.keyHandler.bind(this);

    this.input.addEventListener('input', this.inputHandler);
    document.addEventListener('keydown', this.keyHandler);
  }
  #operator = '';

  // Setters and getters
  set smpteInput(value) {
    this.input.value = value;
  }
  get smpteInput() {
    return this.input.value;
  }
  get total() {
    return this.stack[this.stack.length - 1];
  }

  /////////////////// Methods
  inputHandler(e) {
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
    // Update instance and UI
    this.smpteInput = formattedVal;
  }

  keyHandler(e) {
    switch (e.key) {
      case '+':
        if (this.validateInput()) {
          this.processTimecode(e.key);
          this.smpteInput = '';
        } else {
          console.error('Invalid timecode format');
        }
        break;
      case '-':
        if (this.validateInput()) {
          this.processTimecode(e.key);
          this.timecode = '';
        } else {
          console.error('Invalid timecode format');
        }
        break;
      case 'Enter':
        if (this.validateInput()) {
          this.processTimecode(e.key);
          this.smpteInput = this.total.timecode;
        } else {
          console.error('Invalid timecode format');
        }
        break;
      default:
    }
  }

  validateInput() {
    let timecodeRegex = null;

    if (this.fps === 24) {
      timecodeRegex =
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:[0-2][0-3]$/;
    } else if (this.fps === 25) {
      timecodeRegex =
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:[0-2][0-4]$/;
    } else if (this.fps === 30 || this.fps === 29.97) {
      timecodeRegex =
        /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:[0-2][0-9]$/;
    }
    return timecodeRegex.test(this.smpteInput);
  }

  updatePanel() {}

  processTimecode(key) {
    // Convert timecode to frames and seconds
    console.log(`Processing timecode: ${this.smpteInput}`);
    const seconds = this.#timecodeToSeconds(this.smpteInput);
    const stackSize = this.stack.length;
    let ans = {};
    // const operator = operator;
    // Update panel with input

    if (stackSize >= 1) {
      // Do the maths
      // Push to stack
      // Update the operator
      console.log(`Current operator: ${this.#operator}`);
      switch (this.#operator) {
        case '+':
          ans = this.#secondsToTimecode(this.#add(seconds));
          break;
        case '-':
        case 'Enter':
        default:
          console.log(`No operator yet chosen.`);
      }
      // Push to stack
      this.stack.push(ans);
    } else {
      ans = this.#secondsToTimecode(seconds);
      this.stack.push(ans);
    }
    if (key !== 'Enter') {
      this.#operator = key;
    }

    this.#displayTotal();
  }

  #add(seconds) {
    return this.stack[this.stack.length - 1].seconds + seconds;
  }

  #displayTotal() {
    display.insertAdjacentHTML(
      'afterbegin',
      `<div>${this.#operator} ${this.stack[this.stack.length - 1].timecode}`
    );
  }

  #timecodeToSeconds(timecode) {
    timecode = timecode.split(':');
    const hours = Number(timecode[0]);
    const minutes = Number(timecode[1]);
    const seconds = Number(timecode[2]);
    const frames =
      Number(timecode[3]) +
      this.fps * seconds +
      this.fps * (minutes * 60) +
      this.fps * (hours * 3600);

    return frames / this.fps;
  }

  #framesToSeconds(frames) {
    return frames / this.fps;
  }

  #secondsToFrames(seconds) {
    // This function will eventually contain additional maths for drop-frame timecode.
    return this.fps * seconds;
  }

  #secondsToTimecode(totalSeconds) {
    // Get total frames
    const totalFrames = totalSeconds * this.fps;
    // Generate SMPTE timecode
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const frames = Math.round(
      (totalSeconds - Math.floor(totalSeconds)) * this.fps
    );
    const timecode = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(
      frames
    ).padStart(2, '0')}`;
    return { timecode, frames: totalFrames, seconds: totalSeconds };
  }
}

const calc = new Calculator();

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

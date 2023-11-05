const smpteInput = document.getElementById('tcInput');
const buttons = document.querySelectorAll('.btn');
const keypad = document.getElementById('keypad');
const display = document.getElementById('screen-panel');

console.log(buttons);

class Calculator {
  constructor() {
    this.fps = 25;
    this.stack = [];
    this.mode = 'timecode';

    this.inputHandler = this.inputHandler.bind(this);
    this.keyHandler = this.keyHandler.bind(this);

    smpteInput.addEventListener('input', this.inputHandler);
    document.addEventListener('keydown', this.keyHandler);
  }
  #timecode = '';
  #operator = '';
  #totalSeconds = null;
  #totalFrames = null;
  #total = '';

  // Operator set and get
  set operator(operator) {
    this.#operator = operator;
  }
  get operator() {
    return this.#operator;
  }

  // Current timecode set and get
  set timecode(timecode) {
    this.#timecode = timecode;
  }
  get timecode() {
    return this.#timecode;
  }

  // Get latest stack entry
  get latestStack() {
    console.log(this.stack[this.stack.length - 1]);
    return this.stack[this.stack.length - 1];
  }

  // Set answer
  set total(total) {
    this.#total = total;
  }
  get total() {
    return this.#total;
  }

  // Total frame count set and get
  set totalFrames(frames) {
    this.#totalFrames = frames;
  }
  get totalFrames() {
    return this.#totalFrames;
  }

  // Total seconds set and get
  set totalSeconds(seconds) {
    this.#totalSeconds = seconds;
  }
  get totalSeconds() {
    return this.#totalSeconds;
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
    this.timecode = formattedVal;
    this.updateSMPTEInput();
  }

  keyHandler(e) {
    switch (e.key) {
      case '+':
        if (this.validateInput()) {
          this.processTimecode(e.key);
          this.timecode = '';
          this.updateSMPTEInput();
        } else {
          console.error('Invalid timecode format');
        }
        break;
      case '-':
        if (this.validateInput()) {
          this.processTimecode(e.key);
          this.timecode = '';
          this.updateSMPTEInput();
        } else {
          console.error('Invalid timecode format');
        }
        break;
      case 'Enter':
        if (this.validateInput()) {
          this.processTimecode(e.key);
          this.timecode = this.total;
          this.updateSMPTEInput();
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
    return timecodeRegex.test(this.timecode);
  }

  updateSMPTEInput() {
    smpteInput.value = this.timecode;
  }

  updatePanel() {}

  processTimecode(key) {
    // Convert timecode to frames and seconds
    const frames = this.#timecodeToFrames(this.timecode);
    const seconds = this.#framesToSeconds(frames);

    // Perform maths operation
    console.log(`Current operator: ${this.operator}`);
    switch (this.operator) {
      case '+':
        this.#pushToStack(this.timecode, this.totalFrames, this.totalSeconds);
        this.#add(seconds, frames);
        break;
      case '-':
        this.#pushToStack(this.timecode, this.totalFrames, this.totalSeconds);
        this.#subtract(seconds, frames);
      case 'Enter':
        this.#pushToStack(this.timecode, this.totalFrames, this.totalSeconds);
      default:
        console.log(`No operator yet chosen.`);
        this.total = this.timecode;
        this.totalFrames = frames;
        this.totalSeconds = seconds;
    }

    this.#displayTotal();
    this.operator = key;
    console.log(`Updated operator to: ${this.operator}`);
  }

  #add(seconds, frames) {
    console.log(`Adding ${seconds} to ${this.#totalSeconds}`);
    this.totalSeconds = this.totalSeconds + seconds;
    this.totalFrames = this.totalFrames + frames;
    this.total = this.#framesToTimecode(this.totalFrames);
  }

  #subtract(seconds, frames) {
    this.totalSeconds = this.totalSeconds - seconds;
    this.totalFrames = this.totalFrames - frames;
    this.total = this.#framesToTimecode(this.totalFrames);
  }

  #pushToStack(timecode, frames, seconds) {
    this.stack.push({
      timecode,
      frames,
      seconds,
    });
  }

  #displayTotal() {
    console.log(`Total frames: ${this.totalFrames}`);
    console.log(`Total seconds: ${this.totalSeconds}`);
    if (this.stack.length >= 1) {
      console.log(this.stack);
    }
    display.insertAdjacentHTML('afterbegin', `<div>Timecode: ${this.total}`);
  }

  #timecodeToFrames(timecode) {
    timecode = timecode.split(':');
    const hours = Number(timecode[0]);
    const minutes = Number(timecode[1]);
    const seconds = Number(timecode[2]);
    const frames =
      Number(timecode[3]) +
      this.fps * seconds +
      this.fps * (minutes * 60) +
      this.fps * (hours * 3600);

    return frames;
  }

  #framesToSeconds(frames) {
    return frames / this.fps;
  }

  #framesToTimecode(frames) {
    const totalSeconds = this.#framesToSeconds(frames);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const frameCount = Math.round(
      (totalSeconds - Math.floor(totalSeconds)) * this.fps
    );

    const timecode = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(
      frameCount
    ).padStart(2, '0')}`;
    return timecode;
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

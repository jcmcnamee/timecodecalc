const buttons = document.querySelectorAll('.btn');
const keypad = document.getElementById('keypad');

console.log(buttons);

class Calculator {
  constructor() {
    this.fps = 25;
    this.stack = [];
    this.mode = 'timecode';
    this.input = document.getElementById('tcInput');
    this.display = document.getElementById('screen-panel');

    this.inputHandler = this.inputHandler.bind(this);
    this.keyHandler = this.keyHandler.bind(this);

    this.input.addEventListener('input', this.inputHandler);
    document.addEventListener('keydown', this.keyHandler);
  }
  #expression = '';

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

  ///////////////////// PUSH TO DISPLAY NEEDS TO HAPPEN AFTER VALIDATION AND IN A BETTER WAY IN GENERAL
  ///////////////////// VALIDATION NEEDS TO VALIDATE WHETHER ITS A TIMECODE OR A NUMBER FIRST
  ///////////////////// AND THEN VALIDATE THE TIMECODE FORMAT

  keyHandler(e) {
    switch (e.key) {
      case '+':
        if (this.mode === 'timecode' && this.validateInput()) {
          this.#expression += `${this.timecodeToSeconds()} + `;
        } else if (this.mode === 'number') {
          this.#expression += `${this.smpteInput} + `;
        } else {
          console.error('Invalid timecode format');
        }
        this.#pushToDisplay(`${this.smpteInput} +`);
        this.smpteInput = '';
        this.mode = 'timecode';
        break;
      case '-':
        if (this.mode === 'timecode' && this.validateInput()) {
          this.#expression += `${this.timecodeToSeconds()} - `;
        } else if (this.mode === 'number') {
          this.#expression += `${this.smpteInput} - `;
        } else {
          console.error('Invalid timecode format');
        }
        this.#pushToDisplay(`${this.smpteInput} -`);
        this.smpteInput = '';
        this.mode = 'timecode';
        break;
      case '*':
        if (this.mode === 'timecode' && this.validateInput()) {
          this.#expression += `${this.timecodeToSeconds()} * `;
        } else if (this.mode === 'number') {
          this.#expression += `${this.smpteInput} * `;
        } else {
          console.error('Invalid timecode format');
        }
        this.#pushToDisplay(`${this.smpteInput} &times`);
        this.smpteInput = '';
        this.mode = 'number';
        break;
      case '/':
        if (this.mode === 'timecode' && this.validateInput()) {
          this.#expression += `${this.timecodeToSeconds()} / `;
        } else if (this.mode === 'number') {
          this.#expression += `${this.smpteInput} / `;
        } else {
          console.error('Invalid timecode format');
        }
        this.#pushToDisplay(`${this.smpteInput} &divide`);
        this.smpteInput = '';
        this.mode = 'number';
        break;
      case '(':
        this.#expression += ` ( `;
        this.#pushToDisplay(`( `);
        this.smpteInput = '';
        break;
      case ')':
        this.#expression += `${this.timecodeToSeconds()} ) `;
        this.#pushToDisplay(`${this.smpteInput} )`);
        this.smpteInput = '';
        break;
      case 'Enter':
        if (this.mode === 'timecode' && this.validateInput()) {
          this.#expression += `${this.timecodeToSeconds()}`;
        } else if (this.mode === 'number') {
          this.#expression += `${this.smpteInput}`;
        } else {
          console.error('Invalid timecode format');
        }
        this.#pushToDisplay(`${this.smpteInput} =`);
        this.#pushToDisplay(this.#secondsToTimecode(this.getResult()));
        break;
      default:
    }
  }

  validateInput() {
    if (this.mode === 'timecode') {
      let timecodeRegex = null;

      if (this.fps === 24) {
        timecodeRegex =
          /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:[0-2][0-3]$/;
      } else if (this.fps === 25) {
        timecodeRegex =
          /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:([0-1][0-9]|2[0-4])$/;
      } else if (this.fps === 30 || this.fps === 29.97) {
        timecodeRegex =
          /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]:[0-2][0-9]$/;
      }
      return timecodeRegex.test(this.smpteInput);
    } else if (this.mode === 'number') {
      return true;
    }
  }

  timecodeToSeconds() {
    // Convert timecode to frames and seconds
    const frames = this.#timecodeToFrames(this.smpteInput);
    console.log(this.#framesToSeconds(frames));
    return this.#framesToSeconds(frames);
  }

  #pushToDisplay(expression) {
    if (!this.display.querySelectorAll('div')) {
      console.log('No divs present');
      this.display.insertAdjacentHTML(
        'beforeend',
        `<div class="display-item">${expression}</div>`
      );
    } else {
      this.display.insertAdjacentHTML(
        'beforeend',
        `<div class="display-item">${expression}</div>`
      );
    }
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
    return timecode;
  }

  calculate(expression) {
    try {
      return this.evaluateExpression(expression);
    } catch (error) {
      return 'Error';
    }
  }

  evaluateExpression(expression) {
    const operators = [];
    const operands = [];

    //Loop over string
    for (const token of expression.split(' ')) {
      // If current char is a number
      if (this.isNumber(token)) {
        // Convert to number type, and push to operands
        operands.push(parseFloat(token));
        // Push any opening parenthesis to operators
      } else if (token === '(') {
        operators.push(token);
        // Detect closing parenthesis
      } else if (token === ')') {
        // Gather the data within and perform the calculation
        while (
          operators.length > 0 &&
          operators[operators.length - 1] !== '('
        ) {
          this.calculateOperation(operators, operands);
        }
        // Remove the opening parenthesis
        operators.pop();
        // Else if the current char is an operator
      } else if (this.isOperator(token)) {
        // Loop while there are operators in the stack, and the latest operator is equal to or greater than the current token.
        while (
          operators.length > 0 &&
          this.getPrecedence(operators[operators.length - 1]) >=
            getPrecedence(token)
        ) {
          this.calculateOperation(operators, operands);
        }
        operators.push(token);
      }
    }

    while (operators.length > 0) {
      this.calculateOperation(operators, operands);
    }

    if (operands.length === 1 && operators.length === 0) {
      return operands[0];
    } else {
      throw new Error('Invalid expression');
    }
  }

  isNumber(str) {
    return !isNaN(parseFloat(str));
  }

  isOperator(str) {
    return ['+', '-', '*', '/'].includes(str);
  }

  getPrecedence(operator) {
    if (operator === '+' || operator === '-') return 1;
    if (operator === '*' || operator === '/') return 2;
    return 0;
  }

  calculateOperation(operators, operands) {
    const operator = operators.pop();
    const rightOperand = operands.pop();
    const leftOperand = operands.pop();

    switch (operator) {
      case '+':
        operands.push(leftOperand + rightOperand);
        break;
      case '-':
        operands.push(leftOperand - rightOperand);
        break;
      case '*':
        operands.push(leftOperand * rightOperand);
        break;
      case '/':
        operands.push(leftOperand / rightOperand);
        break;
    }
  }

  getResult() {
    console.log(this.calculate(this.#expression));
    return this.calculate(this.#expression);
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

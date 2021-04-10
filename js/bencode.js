import { isArray } from "util";

export default class Bencode {
  constructor() {
    // Rich record of elements
    this.stack = [];
    // Simple record of elements (just the parsed content)
    this.outputStack = [];
    // The parsed content
    this.output = null;
    // Array of each parsed element with rich information
    this.parsedElems = [];
    // Limit on the character processing
    this.maxChars = 100;
  }

  isEmpty() {
    return !this.stack.length;
  }

  lastElem() {
    return this.stack[this.stack.length - 1];
  }

  lastOutputElem() {
    return this.outputStack[this.outputStack.length - 1];
  }

  update_parent(elem, key) {
    parent = this.lastElem();
    console.log(parent);
    if (parent.type === 'list') {
      parent.content.push(elem);
      this.lastOutputElem().push(elem.simpleContent);
    }
    else if (parent.type === 'dict') {
      // Dictionary handling
      //  -- If it's a dictionary, then we need to add a pair as the next element
      console.log(elem.simpleContent);
      elem = {
        ...elem,
        type: 'pair',
        simpleContent: {
          item1: elem.simpleContent,
          item2: null
        },
        content: {
          item1: elem.simpleContent,
          item2: null
        }
      }
      parent.content.push(elem);
    }
    else if (parent.type === 'pair') {
      parent.content.item2 = elem;
      // Pop the pair off the stack, since we have all the info we need.
      this.stack.pop();
      this.outputStack.pop();
      this.lastOutputElem()[parent.content.item1] = elem.simpleContent;
    }
    return elem;
  }

  parse_int(input, char, i, elemNumber) {
    const j = input.slice(i).indexOf('e');
    const content = parseInt(input.slice(i, (i + j)));
    const start = i - 1;
    const stop = i + j + 1;
    console.log(`---> ${i} - ${i+j} | ${input.slice(0, i)} _${input.slice(i, (i + j))}_ ${input.slice(i+j)}`);
    i += j + 1;
    let elem = {
      source: input,
      start: start,
      stop: stop,
      simpleContent: content,
      content: content,
      type: 'number',
      id: elemNumber
    };
    elemNumber += 1;
    let parent = null;
    if (!this.isEmpty()) {
      elem = this.update_parent(elem);
    }
    else {
      this.output = elem.simpleContent;
    }
    this.parsedElems.push({...elem, parent: {...parent}});
    return i;
  }

  parse_string(input, char, i, elemNumber) {
    const j = input.slice(i).indexOf(':');
    // Assume input is ascii so each char is a byte.
    const numAsciiChars = parseInt(char + '' + input.slice(i, (i + j)));
    const start = i - 1;
    const stop = i + numAsciiChars + 1;
    const content = input.slice(i + j + 1, (i + j + 1 + numAsciiChars));
    i += j + numAsciiChars + 1;
    let elem = {
      source: input,
      start: start,
      stop: stop,
      simpleContent: content,
      content: content,
      type: 'string',
      id: elemNumber
    };
    elemNumber += 1;
    let parent = null;
    if (!this.isEmpty()) {
      elem = this.update_parent(elem);
      // This might have been upgraded to a dictionary key...
      if (elem.type == 'pair') {
        this.stack.push(elem);
        this.outputStack.push(elem.simpleContent);
      }
    }
    else {
      this.output = elem.simpleContent;
    }
    this.parsedElems.push({...elem, parent: {...parent}});
    return i;
  }

  parse_list_open(input, char, i, elemNumber) {
    let elem = {
      source: input,
      start: i - 1,
      stop: null,
      content: [],
      simpleContent: [],
      type: 'list',
      id: elemNumber,
    };
    let parent = null;
    if (!this.isEmpty()) {
      elem = this.update_parent(elem);
    }
    this.stack.push(elem);
    this.outputStack.push(elem.simpleContent);
    this.parsedElems.push({...elem, parent: {...parent}});
    return i;
  }

  parse_dict_open(input, char, i, elemNumber) {
    let elem = {
      source: input,
      start: i - 1,
      stop: null,
      content: [],
      simpleContent: {},
      type: 'dict',
      id: elemNumber,
    };
    let parent = null;

    if (!this.isEmpty()) {
      elem = this.update_parent(elem);
    }
    this.stack.push(elem);
    this.outputStack.push(elem.simpleContent);
    this.parsedElems.push({...elem, parent: {...parent}});
    return i;
  };

  parse_close(input, char, i, elemNumber) {
    const elem = this.stack.pop();
    const outputElem = this.outputStack.pop();
    console.log('--->', elem);
    if (elem) {
      // Maybe convert from pairs to a dictionary here...
      elem.stop = i;
      this.parsedElems[elem.id].stop = elem.stop;
      if (this.isEmpty()) {
        this.output = outputElem;
      }
    }
    return i;
  }

  parse(input) {
    let i = 0;
    let elemNumber = 0;
    let numChars = 0;
    while (i < input.length) {
      // console.log(`${i} | ${input} | ${input.slice(0,  i)} _${input[i]}_ ${input.slice(i+1)} | ${JSON.stringify(this.stack, null, 2)}`);

      if (numChars > this.maxChars) {
        console.error(`Stopping at ${this.maxChars}`);
        return;
      }
      numChars += 1;
      const char = input[i];
      i += 1;

      if (char === 'i') {
        i = this.parse_int(input, char, i, elemNumber);
      }
      else if (char === 'l') {
        i = this.parse_list_open(input, char, i, elemNumber);
      }
      else if (char === 'd') {
        i = this.parse_dict_open(input, char, i, elemNumber);
      }
      else if (char === 'e') {
        i = this.parse_close(input, char, i, elemNumber);
      }
      else if (!isNaN(parseInt(char))) {
        i = this.parse_string(input, char, i, elemNumber);
      }
    }
  }
};


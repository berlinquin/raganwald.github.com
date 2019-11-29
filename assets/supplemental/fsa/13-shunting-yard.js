// 13-compiling-formal-regular-expressions.js

const operatorToPrecedence = new Map(
  Object.entries({
    '|': 1,
    '+': 2,
    '*': 3
  })
);

function peek (stack) {
  return stack[stack.length - 1];
}

function shuntingYardVersion1 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];

  for (const symbol of input) {
    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
    } else {
      outputQueue.push(symbol);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

const binaryOperators = new Set(['+', '|']);

function shuntingYardVersion2 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

function shuntingYardVersion3 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStack = operatorStack.pop();

        outputQueue.push(topOfOperatorStack);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

const operators = new Map(
  Object.entries({
    '|': { symbol: Symbol('|'), precedence: 1, arity: 2, fn: union },
    '+': { symbol: Symbol('+'), precedence: 2, arity: 2, fn: catenation },
    '*': { symbol: Symbol('*'), precedence: 3, arity: 1, fn: kleeneStar }
  })
);

function isBinaryOperator (symbol) {
  return operators.has(symbol) && operators.get(symbol).arity === 2;
}

function shuntingYard (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '\\') {
      if (input.length === 0) {
        error('Escape character has nothing to follow');
      } else {
        const valueSymbol = input.shift();

        // treat this new symbol as a value,
        // no matter what
        if (awaitingValue) {
          // push the string value of the valueSYmbol

          outputQueue.push(valueSymbol);
          awaitingValue = false;
        } else {
          // implicit catenation

          input.unshift(valueSymbol);
          input.unshift('\\');
          input.unshift('+');
          awaitingValue = false;
        }

      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStack = operatorStack.pop();

        outputQueue.push(operators.get(topOfOperatorStack).symbol);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operators.has(symbol)) {
      const precedence = operators.get(symbol).precedence;

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStackPrecedence = operators.get(peek(operatorStack)).precedence;

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(operators.get(topOfOperatorStack).symbol);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isBinaryOperator(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('+');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(operators.get(topOfOperatorStack).symbol);
  }

  return outputQueue;
}

const symbols = new Map(
  [...operators.entries()].map(
    ([key, { symbol, arity, fn }]) => [symbol, { arity, fn }]
  )
);

function rpnToDescription (rpn) {
  if (rpn.length === 0) {
    return EMPTY_SET;
  } else {
    const stack = [];

    for (const element of rpn) {
      if (element === '∅') {
        stack.push(EMPTY_SET);
      } else if (element === 'ε') {
        stack.push(EMPTY_STRING);
      } else if (typeof element === 'string') {
        stack.push(just1(element));
      } else if (symbols.has(element)) {
        const { arity, fn } = symbols.get(element);

        if (stack.length < arity) {
          error(`Not emough values on the stack to use ${element}`)
        } else {
          const args = [];

          for (let counter = 0; counter < arity; ++counter) {
            args.unshift(stack.pop());
          }

          stack.push(fn.apply(null, args))
        }
      } else {
        error(`Don't know what to do with ${element}'`)
      }
    }
    if (stack.length != 1) {
      error(`should only be one value to return, but there were ${stack.length}`);
    } else {
      return stack[0];
    }
  }
}

function toFiniteStateRecognizer (formalRegularExpression) {
  return rpnToDescription(shuntingYard(formalRegularExpression));
}

// ----------

const binary2 = union(just1('0'), catenation(just1('1'), kleeneStar(union(just('0'), just('1')))));

verify(binary2, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
});

const regMaybeInald = catenation(
  just('r'),
  just('e'),
  just('g'),
  union(
    EMPTY_STRING,
    catenation(
      just('i'),
      just('n'),
      just('a'),
      just('l'),
      just('d')
    )
  )
);

verify(regMaybeInald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});

verify(toFiniteStateRecognizer(''), {
  '': false,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('ε'), {
  '': true,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0*'), {
  '': true,
  '0': true,
  '1': false,
  '00': true,
  '01': false,
  '10': false,
  '11': false,
  '000': true,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0|(1(0|1)*)'), {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true
});
import {parse} from './math-ast.js';
import {
  type Numeric,
  random,
  VECTOR_ROUTINES,
  VECTOR_PROPERTIES,
} from './vector-routines';
import {EXTRA_FUNCTIONS} from './extra-functions';

export type EvaluationContext = Map<string, Numeric | Function>;

type BinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '**'
  | '<='
  | '>='
  | '<'
  | '>'
  | '==='
  | '!=='
  | '=='
  | '!='
  | '&&'
  | '||';

type Program = {
  type: 'Program';
  body: Statement[];
};

type ExpressionStatement = {
  type: 'ExpressionStatement';
  expression: Expression;
};

type ForStatement = {
  type: 'ForStatement';
  init: Expression;
  test: Expression;
  update: Expression;
  body: Statement;
};

type BlockStatement = {
  type: 'BlockStatement';
  body: Statement[];
};

type Statement = ExpressionStatement | ForStatement | BlockStatement;

type BinaryExpression = {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
};

type UnaryExpression = {
  type: 'UnaryExpression';
  operator: '+' | '-' | '!';
  argument: Expression;
  prefix: boolean;
};

type CallExpression = {
  type: 'CallExpression';
  callee: Identifier;
  arguments: Expression[];
};

type AssignmentExpression = {
  type: 'AssignmentExpression';
  operator: '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '**=';
  left: Identifier | ComputedMemberExpression;
  right: Expression;
};

type UpdateExpression = {
  type: 'UpdateExpression';
  operator: '++' | '--';
  argument: Identifier;
  prefix: boolean;
};

type MemberExpression = {
  type: 'MemberExpression';
  object: Identifier;
  property: Identifier;
  computed: false;
};

type ComputedMemberExpression = {
  type: 'MemberExpression';
  object: Identifier;
  property: Expression;
  computed: true;
};

type ConditionalExpression = {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
};

type Identifier = {
  type: 'Identifier';
  name: string;
};

type Literal = {
  type: 'Literal';
  value: Numeric;
};

type Expression =
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | AssignmentExpression
  | UpdateExpression
  | MemberExpression
  | ComputedMemberExpression
  | ConditionalExpression
  | Identifier
  | Literal;

function applyTernaryOperator(
  test: Numeric,
  consequent: Numeric,
  alternate: Numeric
) {
  if (typeof test === 'number') {
    if (typeof consequent === 'number') {
      if (typeof alternate === 'number') {
        return test ? consequent : alternate;
      }
      return alternate.map(a => (test ? consequent : a));
    }
    if (typeof alternate === 'number') {
      return consequent.map(c => (test ? c : alternate));
    }
    return consequent.map((c, i) => (test ? c : alternate[i]));
  }
  if (typeof consequent === 'number') {
    if (typeof alternate === 'number') {
      return test.map(t => (t ? consequent : alternate));
    }
    return test.map((t, i) => (t ? consequent : alternate[i]));
  }
  if (typeof alternate === 'number') {
    return test.map((t, i) => (t ? consequent[i] : alternate));
  }
  return test.map((t, i) => (t ? consequent[i] : alternate[i]));
}

function applyBinaryOperator(
  operator: BinaryOperator,
  left: Numeric,
  right: Numeric
) {
  if (typeof left === 'number') {
    if (typeof right === 'number') {
      switch (operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
        case '%':
          return left % right;
        case '**':
          return left ** right;
        case '<=':
          return Number(left <= right);
        case '>=':
          return Number(left >= right);
        case '<':
          return Number(left < right);
        case '>':
          return Number(left > right);
        case '===':
          return Number(left === right);
        case '!==':
          return Number(left !== right);
        case '==':
          // eslint-disable-next-line eqeqeq
          return Number(left == right);
        case '!=':
          // eslint-disable-next-line eqeqeq
          return Number(left != right);
        case '&&':
          return Number(left && right);
        case '||':
          return Number(left || right);
      }
    } else {
      switch (operator) {
        case '+':
          return right.map(r => left + r);
        case '-':
          return right.map(r => left - r);
        case '*':
          return right.map(r => left * r);
        case '/':
          return right.map(r => left / r);
        case '%':
          return right.map(r => left % r);
        case '**':
          return right.map(r => left ** r);
        case '<=':
          return right.map(r => Number(left <= r));
        case '>=':
          return right.map(r => Number(left >= r));
        case '<':
          return right.map(r => Number(left < r));
        case '>':
          return right.map(r => Number(left > r));
        case '===':
          return right.map(r => Number(left === r));
        case '!==':
          return right.map(r => Number(left !== r));
        case '==':
          // eslint-disable-next-line eqeqeq
          return right.map(r => Number(left == r));
        case '!=':
          // eslint-disable-next-line eqeqeq
          return right.map(r => Number(left != r));
        case '&&':
          return right.map(r => Number(left && r));
        case '||':
          return right.map(r => Number(left || r));
      }
    }
  } else {
    if (typeof right === 'number') {
      switch (operator) {
        case '+':
          return left.map(l => l + right);
        case '-':
          return left.map(l => l - right);
        case '*':
          return left.map(l => l * right);
        case '/':
          return left.map(l => l / right);
        case '%':
          return left.map(l => l % right);
        case '**':
          return left.map(l => l ** right);
        case '<=':
          return left.map(l => Number(l <= right));
        case '>=':
          return left.map(l => Number(l >= right));
        case '<':
          return left.map(l => Number(l < right));
        case '>':
          return left.map(l => Number(l > right));
        case '===':
          return left.map(l => Number(l === right));
        case '!==':
          return left.map(l => Number(l !== right));
        case '==':
          // eslint-disable-next-line eqeqeq
          return left.map(l => Number(l == right));
        case '!=':
          // eslint-disable-next-line eqeqeq
          return left.map(l => Number(l != right));
        case '&&':
          return left.map(l => Number(l && right));
        case '||':
          return left.map(l => Number(l || right));
      }
    } else {
      // Trick TypeScript into accepting seemingly unreachable code below.
      switch (operator as any) {
        case '+':
          return left.map((l, i) => l + right[i]);
        case '-':
          return left.map((l, i) => l - right[i]);
        case '*':
          return left.map((l, i) => l * right[i]);
        case '/':
          return left.map((l, i) => l / right[i]);
        case '%':
          return left.map((l, i) => l % right[i]);
        case '**':
          return left.map((l, i) => l ** right[i]);
        case '<=':
          return left.map((l, i) => Number(l <= right[i]));
        case '>=':
          return left.map((l, i) => Number(l >= right[i]));
        case '<':
          return left.map((l, i) => Number(l < right[i]));
        case '>':
          return left.map((l, i) => Number(l > right[i]));
        case '===':
          return left.map((l, i) => Number(l === right[i]));
        case '!==':
          return left.map((l, i) => Number(l !== right[i]));
        case '==':
          // eslint-disable-next-line eqeqeq
          return left.map((l, i) => Number(l == right[i]));
        case '!=':
          // eslint-disable-next-line eqeqeq
          return left.map((l, i) => Number(l != right[i]));
        case '&&':
          return left.map((l, i) => Number(l && right[i]));
        case '||':
          return left.map((l, i) => Number(l || right[i]));
      }
    }
  }
  // The type hierarchy is incomplete so this is actually reachable.
  throw new Error(`Unimplemented operator '${operator}'`);
}

function parseAst(source: string): Program {
  return parse(source);
}

function evaluateExpression(
  ast: Expression,
  context: EvaluationContext
): Numeric {
  if (ast.type === 'Literal') {
    return ast.value;
  } else if (ast.type === 'ConditionalExpression') {
    const test = evaluateExpression(ast.test, context);
    const consequent = evaluateExpression(ast.consequent, context);
    const alternate = evaluateExpression(ast.alternate, context);
    return applyTernaryOperator(test, consequent, alternate);
  } else if (ast.type === 'BinaryExpression') {
    const left = evaluateExpression(ast.left, context);
    const right = evaluateExpression(ast.right, context);
    return applyBinaryOperator(ast.operator, left, right);
  } else if (ast.type === 'UnaryExpression') {
    if (!ast.prefix) {
      throw new Error('Only prefix unary operators implemented');
    }
    const argument = evaluateExpression(ast.argument, context);
    switch (ast.operator) {
      case '+':
        return typeof argument === 'number' ? +argument : argument.map(x => +x);
      case '-':
        return typeof argument === 'number' ? -argument : argument.map(x => -x);
      case '!':
        return typeof argument === 'number'
          ? Number(!argument)
          : argument.map(x => Number(!x));
      default:
        throw new Error(`Unimplemented operator '${(ast as any).operator}'`);
    }
  } else if (ast.type === 'CallExpression') {
    if (!context.has(ast.callee.name)) {
      throw new Error(`ReferenceError: ${ast.callee.name} is not defined`);
    }
    const callee = context.get(ast.callee.name);
    if (typeof callee !== 'function') {
      throw new Error(`TypeError: ${ast.callee.name} is not a function`);
    }
    const args = ast.arguments.map(arg => evaluateExpression(arg, context));
    if (args.every(arg => typeof arg === 'number')) {
      return callee(...args);
    }
    if (args.length === 1) {
      return (args[0] as Float64Array).map(x => callee(x));
    }
    if (args.length === 2) {
      if (typeof args[0] === 'number') {
        const x = args[0];
        return (args[1] as Float64Array).map(y => callee(x, y));
      } else if (typeof args[1] === 'number') {
        const y = args[1];
        return (args[0] as Float64Array).map(x => callee(x, y));
      }
      const ys = args[1] as Float64Array;
      return (args[0] as Float64Array).map((x, i) => callee(x, ys[i]));
    }
    let vectorLength = 1;
    for (const arg of args) {
      if (typeof arg !== 'number') {
        vectorLength = arg.length;
        break;
      }
    }
    const result = new Float64Array(vectorLength);
    for (let i = 0; i < vectorLength; ++i) {
      const subArgs: number[] = [];
      for (const arg of args) {
        if (typeof arg === 'number') {
          subArgs.push(arg);
        } else {
          subArgs.push(arg[i]);
        }
      }
      result[i] = callee(...subArgs);
    }
    return result;
  } else if (ast.type === 'Identifier') {
    if (!context.has(ast.name)) {
      throw new Error(`ReferenceError: ${ast.name} is not defined`);
    }
    const value = context.get(ast.name)!;
    if (typeof value === 'function') {
      throw new Error('Cannot evaluate to a function');
    }
    return value;
  } else if (ast.type === 'AssignmentExpression') {
    let right: Numeric;
    if (ast.operator === '=') {
      right = evaluateExpression(ast.right, context);
    } else {
      right = evaluateExpression(
        {
          type: 'BinaryExpression',
          operator: ast.operator.slice(0, -1) as BinaryOperator,
          left: ast.left,
          right: ast.right,
        },
        context
      );
    }
    if (ast.left.type === 'Identifier') {
      context.set(ast.left.name, right);
      return right;
    } else {
      const object = evaluateExpression(ast.left.object, context);
      if (typeof object === 'number') {
        throw new Error('Cannot assign properties of numbers');
      }
      const property = evaluateExpression(ast.left.property, context);
      if (typeof property === 'number') {
        if (typeof right !== 'number') {
          throw new Error('Must assign a number');
        }
        if (property < 0) {
          return (object[object.length + property] = right);
        }
        return (object[property] = right);
      }
      if (typeof right === 'number') {
        for (let i = 0; i < object.length; ++i) {
          if (property[i]) {
            object[i] = right;
          }
        }
      } else {
        let j = 0;
        for (let i = 0; i < object.length; ++i) {
          if (property[i]) {
            object[i] = right[j++];
          }
        }
      }
      return right;
    }
  } else if (ast.type === 'UpdateExpression') {
    const argument = evaluateExpression(ast.argument, context);
    let newValue: Numeric;
    if (ast.operator === '++') {
      newValue =
        typeof argument === 'number' ? argument + 1 : argument.map(a => a + 1);
    } else {
      newValue =
        typeof argument === 'number' ? argument - 1 : argument.map(a => a - 1);
    }
    context.set(ast.argument.name, newValue);
    return ast.prefix ? newValue : argument;
  } else if (ast.type === 'MemberExpression') {
    const object = evaluateExpression(ast.object, context);
    if (typeof object === 'number') {
      throw new Error('Cannot access properties of numbers');
    }
    if (!ast.computed) {
      return VECTOR_PROPERTIES[ast.property.name](object);
    }
    const property = evaluateExpression(ast.property, context);
    if (typeof property === 'number') {
      if (property < 0) {
        return object[object.length + property];
      }
      return object[property];
    } else {
      // We only have one data type so we choose the boolean implementation of numpy.
      return object.filter((_, i) => property[i]);
    }
  }
  throw new Error(`${(ast as any).type} not implemented`);
}

function evaluateStatement(
  ast: Statement,
  context: EvaluationContext
): Numeric | undefined {
  if (ast.type === 'ExpressionStatement') {
    return evaluateExpression(ast.expression, context);
  } else if (ast.type === 'BlockStatement') {
    let result: Numeric | undefined;
    for (const statement of ast.body) {
      result = evaluateStatement(statement, context);
    }
    return result;
  } else if (ast.type === 'ForStatement') {
    let result: Numeric | undefined;
    for (
      result = evaluateExpression(ast.init, context);
      (result = evaluateExpression(ast.test, context));
      result = evaluateExpression(ast.update, context)
    ) {
      result = evaluateStatement(ast.body, context);
    }
    return result;
  }
  throw new Error(`${(ast as any).type} not implemented`);
}

function defaultContext(context?: EvaluationContext) {
  if (context === undefined) {
    context = new Map();
  } else {
    context = new Map(context);
  }

  const mathPropNames = Object.getOwnPropertyNames(Math);
  const mathRecord = Math as unknown as Record<string, number | Function>;
  for (const name of mathPropNames) {
    if (!context.has(name)) {
      if (name === 'random') {
        context.set(name, random);
      } else {
        context.set(name, mathRecord[name]);
      }
    }
  }

  for (const name in VECTOR_ROUTINES) {
    if (!context.has(name)) {
      context.set(name, VECTOR_ROUTINES[name]);
    }
  }

  for (const name in EXTRA_FUNCTIONS) {
    if (!context.has(name)) {
      context.set(name, EXTRA_FUNCTIONS[name]);
    }
  }
  return context;
}

export function evalMath(str: string, context?: EvaluationContext): Numeric {
  const program = parseAst(str);

  context = defaultContext(context);

  let result: Numeric | undefined;
  for (const statement of program.body) {
    result = evaluateStatement(statement, context);
  }
  if (result === undefined) {
    throw new Error('Expression must evaluate to a value');
  }
  return result;
}

export function em(strings: TemplateStringsArray, ...args: Numeric[]): Numeric {
  const context: EvaluationContext = new Map();
  let str = strings[0];
  for (let i = 0; i < args.length; ++i) {
    const identifier = `__templateArgument${i}`;
    context.set(identifier, args[i]);
    str += identifier + strings[i + 1];
  }
  return evalMath(str, context);
}

export function evalIncremental(
  str: string,
  output: Float64Array,
  context?: EvaluationContext
) {
  const program = parseAst(str);

  context = defaultContext(context);

  // TODO: Reduce AST as much as possible

  const iterationContext: EvaluationContext = new Map();
  for (let i = 0; i < output.length; ++i) {
    for (const [key, value] of context) {
      if (typeof value === 'number' || typeof value === 'function') {
        iterationContext.set(key, value);
      } else {
        iterationContext.set(key, value[i]);
      }
    }
    let result: Numeric | undefined;
    for (const statement of program.body) {
      result = evaluateStatement(statement, iterationContext);
    }
    if (result === undefined) {
      throw new Error('Expression must evaluate to a value');
    }
    if (typeof result !== 'number') {
      throw new Error('Incremenatal evaluation must produce numbers');
    }
    output[i] = result;
  }
}

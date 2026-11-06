import ts from 'typescript';

export type Assertion = { name: string; passed: boolean; actual?: string; expected?: string; error?: string };
export type RunResult = { assertions: Assertion[]; complete: boolean; explanation: string; duration: number; engine: string };
type Value = unknown;
const show = (v: unknown) => JSON.stringify(v) ?? String(v);

// Interpret an allowlisted AST; submitted JavaScript is never eval'd or imported.
export function runLocal(lessonId: string, code: string): RunResult {
  const started = performance.now();
  const file = ts.createSourceFile('submission.test.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const diagnostics = (file as unknown as { parseDiagnostics: ts.Diagnostic[] }).parseDiagnostics;
  if (diagnostics.length) throw new Error(ts.flattenDiagnosticMessageText(diagnostics[0].messageText, '\n'));
  const evaluate = (mutation: number) => {
    const assertions: Assertion[] = [];
    let currentTest = 'Test'; let calls = 0;
    const inputs: { name: string; args: unknown[] }[] = [];
    const functions: Record<string, (...args: unknown[]) => unknown> = {
      add: (a, b) => mutation === 1 ? Number(a) - Number(b) : Number(a) + Number(b),
      hasFreeShipping: a => mutation === 1 ? Number(a) > 50 : mutation === 2 ? true : Number(a) >= 50,
      cartTotal: a => { if (!Array.isArray(a) || !a.every(x => typeof x === 'number')) throw Error('cartTotal expects an array of numbers.'); return mutation === 1 ? Number(a[0] ?? 0) : mutation === 2 && !a.length ? 1 : a.reduce((s: number, x: number) => s + x, 0); },
      checkout: (a, b) => { if (!Array.isArray(a)) throw Error('checkout expects an array of prices.'); const sum = a.reduce((s: number, x: number) => s + x, 0); return mutation === 1 ? sum : mutation === 2 ? sum * (1 + Number(b) / 100) : sum * (1 - Number(b) / 100); },
      applyDiscount: (a, b) => Number(a) * (1 + (mutation === 1 ? 1 : -1) * Number(b) / 100),
      canRegister: a => mutation === 1 ? Number(a) > 18 : mutation === 2 ? Number(a) >= 17 : Number(a) >= 18,
    };
    const subject = ({ 'first-test': 'add', 'edge-cases': 'hasFreeShipping', 'test-arrays': 'cartTotal', integration: 'checkout', 'bug-discount': 'applyDiscount', 'bug-validation': 'canRegister' } as Record<string, string>)[lessonId];
    const exec = (node: ts.Node, scope: Map<string, Value>): Value => {
      if (++calls > 5000) throw Error('This exercise is limited to 5,000 syntax steps. Keep your test small.');
      if (ts.isSourceFile(node) || ts.isBlock(node)) { for (const s of node.statements) exec(s, scope); return; }
      if (ts.isImportDeclaration(node)) {
        const path = ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : '';
        if (!['vitest', './app'].includes(path)) throw Error("Only imports from 'vitest' and './app' are supported in local practice mode.");
        const bindings = node.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings)) for (const e of bindings.elements) scope.set(e.name.text, (e.propertyName ?? e.name).text);
        return;
      }
      if (ts.isExpressionStatement(node)) return exec(node.expression, scope);
      if (ts.isVariableStatement(node)) { for (const d of node.declarationList.declarations) { if (!ts.isIdentifier(d.name) || !d.initializer) throw Error('Use named constants with a value.'); scope.set(d.name.text, exec(d.initializer, scope)); } return; }
      if (ts.isNumericLiteral(node)) return Number(node.text);
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
      if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
      if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
      if (node.kind === ts.SyntaxKind.NullKeyword) return null;
      if (ts.isIdentifier(node)) { if (node.text === 'undefined') return undefined; if (scope.has(node.text)) return scope.get(node.text); throw Error(`Unknown name: ${node.text}. Import the function from './app'.`); }
      if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return exec(node.expression, scope);
      if (ts.isArrayLiteralExpression(node)) return node.elements.map(e => exec(e, scope));
      if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(p => { if (!ts.isPropertyAssignment(p)) throw Error('Use simple object properties.'); return [ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : p.name.getText(file), exec(p.initializer, scope)]; }));
      if (ts.isPrefixUnaryExpression(node)) { const value = exec(node.operand, scope); if (node.operator === ts.SyntaxKind.MinusToken) return -Number(value); if (node.operator === ts.SyntaxKind.PlusToken) return Number(value); if (node.operator === ts.SyntaxKind.ExclamationToken) return !value; }
      if (ts.isCallExpression(node)) {
        if (ts.isIdentifier(node.expression)) {
          const name = String(scope.get(node.expression.text) ?? node.expression.text);
          if (['describe', 'it', 'test'].includes(name)) {
            const callback = node.arguments[1];
            if (!callback || (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))) throw Error('Use a callback for describe or it.');
            const previous = currentTest; if (name !== 'describe') currentTest = String(exec(node.arguments[0], scope));
            exec(callback.body, new Map(scope)); currentTest = previous; return;
          }
          if (name === subject) { const args = node.arguments.map(a => exec(a, scope)); inputs.push({ name, args }); return functions[name](...args); }
          throw Error(`The local runner does not support ${name}(). Use the lesson function and expect assertions.`);
        }
        if (ts.isPropertyAccessExpression(node.expression)) {
          const matcher = node.expression.name.text;
          let target = node.expression.expression; let negated = false;
          if (ts.isPropertyAccessExpression(target) && target.name.text === 'not') { negated = true; target = target.expression; }
          if (!ts.isCallExpression(target) || !ts.isIdentifier(target.expression) || String(scope.get(target.expression.text) ?? target.expression.text) !== 'expect') throw Error('Only expect(...).matcher(...) calls are supported.');
          const actual = exec(target.arguments[0], scope); const expected = node.arguments[0] ? exec(node.arguments[0], scope) : undefined;
          let passed: boolean;
          if (matcher === 'toBe') passed = Object.is(actual, expected);
          else if (matcher === 'toEqual' || matcher === 'toStrictEqual') passed = show(actual) === show(expected);
          else if (matcher === 'toBeTruthy') passed = !!actual;
          else if (matcher === 'toBeFalsy') passed = !actual;
          else if (matcher === 'toBeGreaterThan') passed = Number(actual) > Number(expected);
          else if (matcher === 'toBeLessThan') passed = Number(actual) < Number(expected);
          else if (matcher === 'toBeCloseTo') passed = Math.abs(Number(actual) - Number(expected)) < Math.pow(10, -Number(node.arguments[1] ? exec(node.arguments[1], scope) : 2)) / 2;
          else throw Error(`Matcher ${matcher} is not supported in local mode. Try toBe or toEqual.`);
          assertions.push({ name: currentTest, passed: negated ? !passed : passed, actual: show(actual), expected: `${negated ? 'not ' : ''}${show(expected)}` }); return;
        }
      }
      throw Error(`Local practice mode does not support this syntax yet: ${ts.SyntaxKind[node.kind]}. Use imports, describe, it, constants, and expect. Full Vitest is available in Docker mode.`);
    };
    exec(file, new Map());
    return { assertions, inputs };
  };
  const baseline = evaluate(0);
  const allPassed = baseline.assertions.length > 0 && baseline.assertions.every(a => a.passed);
  const count = ['edge-cases', 'test-arrays', 'integration', 'bug-validation'].includes(lessonId) ? 2 : 1;
  let mutationsCaught = 0;
  if (allPassed) for (let m = 1; m <= count; m++) { try { if (evaluate(m).assertions.some(a => !a.passed)) mutationsCaught++; } catch { mutationsCaught++; } }
  const args = baseline.inputs.map(i => i.args);
  const objectiveMet = lessonId === 'edge-cases' ? args.some(a => a[0] === 50) && args.some(a => Number(a[0]) < 50)
    : lessonId === 'test-arrays' ? args.some(a => Array.isArray(a[0]) && a[0].length > 1) && args.some(a => Array.isArray(a[0]) && a[0].length === 0)
    : lessonId === 'integration' ? args.some(a => Array.isArray(a[0]) && a[0].length > 1 && Number(a[1]) > 0) && args.some(a => a[1] === 0)
    : lessonId === 'bug-validation' ? args.some(a => a[0] === 18) && args.some(a => a[0] === 17) : args.length > 0;
  const complete = allPassed && mutationsCaught === count && objectiveMet;
  return { assertions: baseline.assertions, complete, duration: Math.round(performance.now() - started), engine: 'Local practice interpreter', explanation: !baseline.assertions.length ? 'No assertions found. Add an expect(...).toBe(...) assertion.' : !allPassed ? 'Your test found a difference. Compare the actual and expected values below, then check the application code. A failing test is useful feedback!' : complete ? 'Nicely done! Your assertions pass for the correct implementation and catch the deliberate bugs. You verified the lesson’s learning objective.' : 'Your assertions pass, but the objective is not fully covered. Test the required inputs and assert their results. A useful test must also catch an incorrect implementation.' };
}

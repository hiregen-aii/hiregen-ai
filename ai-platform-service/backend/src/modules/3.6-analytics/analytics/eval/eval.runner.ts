import type {
  EvalResult,
  EvalSummary,
  GoldenCase,
} from "./eval.types";

export interface EvalRunner {
  runCase(testCase: GoldenCase): Promise<EvalResult>;
}

export async function runEvaluation(
  cases: GoldenCase[],
  runner: EvalRunner,
): Promise<EvalSummary> {
  const results: EvalResult[] = [];

  for (const testCase of cases) {
    results.push(await runner.runCase(testCase));
  }

  const successfulCases = results.filter(
    (result) => result.success,
  ).length;

  const totalCases = results.length;
  const totalLatency = results.reduce(
    (sum, result) => sum + result.latencyMs,
    0,
  );
  const totalTokens = results.reduce(
    (sum, result) => sum + (result.totalTokens ?? 0),
    0,
  );
  const totalCostUsd = results.reduce(
    (sum, result) => sum + (result.costUsd ?? 0),
    0,
  );

  return {
    totalCases,
    successfulCases,
    failedCases: totalCases - successfulCases,
    averageLatencyMs:
      totalCases > 0 ? totalLatency / totalCases : 0,
    totalTokens,
    totalCostUsd,
    successRate:
      totalCases > 0 ? successfulCases / totalCases : 0,
    results,
  };
}

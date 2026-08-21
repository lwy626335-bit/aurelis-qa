import { describe, expect, it } from "vitest";

import { parseStageOutput } from "./brand.js";

const completed = {
  error: null,
  incomplete_details: null,
  output: [],
  status: "completed",
};

describe("brand response diagnostics", () => {
  it("returns parsed structured output", () => {
    expect(parseStageOutput({ ...completed, output_parsed: { score: 10 } }, "evaluator")).toEqual({ score: 10 });
  });

  it("records incomplete response details", () => {
    expect(() => parseStageOutput({ ...completed, incomplete_details: { reason: "max_output_tokens" }, output_parsed: null, status: "incomplete" }, "evaluator"))
      .toThrow("AI_EVALUATOR_INCOMPLETE:max_output_tokens");
  });

  it("records model refusals", () => {
    expect(() => parseStageOutput({ ...completed, output: [{ type: "message", content: [{ type: "refusal", refusal: "Cannot evaluate this input." }] }], output_parsed: null }, "reviewer"))
      .toThrow("AI_REVIEWER_REFUSED:Cannot evaluate this input.");
  });

  it("distinguishes failed and unparsed responses", () => {
    expect(() => parseStageOutput({ ...completed, error: { message: "upstream failure" }, output_parsed: null, status: "failed" }, "reviewer"))
      .toThrow("AI_REVIEWER_FAILED:upstream failure");
    expect(() => parseStageOutput({ ...completed, output_parsed: null }, "evaluator"))
      .toThrow("AI_EVALUATOR_UNPARSED:status=completed");
  });
});

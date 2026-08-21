import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreGauge } from "./score-gauge";

describe("ScoreGauge", () => {
  it("exposes the score and range to assistive technology", () => {
    render(<ScoreGauge score={87.6} />);
    expect(screen.getByRole("img", { name: "Quality score: 87.6 out of 100" })).toBeInTheDocument();
    expect(screen.getByText("87.6")).toBeInTheDocument();
  });
});

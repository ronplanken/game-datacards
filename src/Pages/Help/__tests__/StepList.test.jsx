import { render, screen } from "@testing-library/react";
import { StepList, Step } from "../components/StepList";

describe("StepList", () => {
  it("renders numbered steps", () => {
    const { container } = render(
      <StepList>
        <Step title="First step">First content</Step>
        <Step title="Second step">Second content</Step>
      </StepList>,
    );
    expect(container.querySelector(".help-step-list")).toBeInTheDocument();
    expect(container.querySelectorAll(".help-step")).toHaveLength(2);
  });

  it("renders step titles and content", () => {
    render(
      <StepList>
        <Step title="Create a frame">Add elements inside it</Step>
      </StepList>,
    );
    expect(screen.getByText("Create a frame")).toBeInTheDocument();
    expect(screen.getByText("Add elements inside it")).toBeInTheDocument();
  });

  it("renders step without title", () => {
    const { container } = render(
      <StepList>
        <Step>Just content</Step>
      </StepList>,
    );
    expect(screen.getByText("Just content")).toBeInTheDocument();
    expect(container.querySelector(".help-step-title")).not.toBeInTheDocument();
  });
});

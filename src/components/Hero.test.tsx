import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the main heading", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Ameenly/i);
  });

  it("renders the subheading", () => {
    render(<Hero />);
    expect(screen.getByText(/Share duas. Make duas for others/i)).toBeInTheDocument();
  });

  it("has main content landmark", () => {
    render(<Hero />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

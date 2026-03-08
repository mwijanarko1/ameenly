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

  it("renders the supporting description", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Submit your dua to the public wall or create a private group/i)
    ).toBeInTheDocument();
  });
});

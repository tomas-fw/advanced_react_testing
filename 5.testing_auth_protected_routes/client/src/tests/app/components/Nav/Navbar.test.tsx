import { App } from "../../../../App";
import { NavBar } from "../../../../app/components/nav/NavBar";
import { act, fireEvent, render, screen } from "../../../../test-utils";

describe("Implementation tests for NavBar component", () => {
  test("redirects to sign int page", () => {
    const { history } = render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: /sign in/i });

    act(() => {
      fireEvent.click(signInButton);
    });

    expect(history.location.pathname).toBe("/signin");
  });

  test("displays sign in button if user is not logged in", () => {
    render(<NavBar />);

    const signInButton = screen.getByRole("button", { name: /sign in/i });

    expect(signInButton).toBeInTheDocument();
  });

  test("displays user's email and singout button if user is logged in", () => {
    const testUser = {
      email: "test@email.test",
    };
    render(<NavBar />, { preloadedState: { user: { userDetails: testUser } } });

    const signInButton = screen.queryByRole("button", { name: /sign in/i });
    const signOutButton = screen.getByRole("button", { name: /sign out/i });
    const userEmail = screen.getByText(/test@email.test/i);

    expect(signInButton).not.toBeInTheDocument();
    expect(signOutButton).toBeInTheDocument();
    expect(userEmail).toBeInTheDocument();
  });
});

describe("Behavoir test for NavBar component", () => {
  test("view sign-in page when clicking sign in button in navbar", () => {
    render(<App />);

    const signInButton = screen.getByRole("button", { name: /sign in/i });

    act(() => {
      fireEvent.click(signInButton);
    });

    const heading = screen.getByRole("heading", {
      name: /sign in to your account/i,
    });

    expect(heading).toBeInTheDocument();
  });
});

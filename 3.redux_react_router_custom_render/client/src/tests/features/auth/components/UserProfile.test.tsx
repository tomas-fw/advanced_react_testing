import { App } from "../../../../App";
import { UserProfile } from "../../../../features/auth/components/UserProfile";
import { render, screen } from "../../../../test-utils";

const testUser = {
  email: "test@email.test",
};

describe("Implementation tests for UserProfile component", () => {
  test("greets user", () => {
    render(<UserProfile />, {
      preloadedState: { user: { userDetails: testUser } },
    });
    expect(screen.getByText(/hi, test@email.test/i)).toBeInTheDocument();
  });

  test("redirects to sign in route if user is falsy", () => {
    const { history } = render(<UserProfile />);
    expect(history.location.pathname).toBe("/signin");
  });
});

describe("Behavoir test for UserProfile component", () => {
  test("view sign-in page when loading profile while not logged in", () => {
    render(<App />, { routeHistory: ["/profile"] });

    const heading = screen.getByRole("heading", {
      name: /sign in to your account/i,
    });

    expect(heading).toBeInTheDocument();
  });
});

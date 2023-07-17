import { App } from "../../../App";
import { render, screen } from "../../../test-utils";

describe("Non protected routes", () => {
  test.each([
    { routeName: "Home", routePath: "/", headingMatch: /welcome/i },
    {
      routeName: "Signin",
      routePath: "/signIn",
      headingMatch: /sign in to your account/i,
    },
    {
      routeName: "Shows",
      routePath: "/shows",
      headingMatch: /upcoming shows/i,
    },
    {
      routeName: "Band 0",
      routePath: "/bands/0",
      headingMatch: /avalanche of cheese/i,
    },
    {
      routeName: "Band 1",
      routePath: "/bands/1",
      headingMatch: /the joyous nun riot/i,
    },
  ])(
    "$routeName page does not redirect to login screen",
    async ({ routePath, headingMatch }) => {
      render(<App />, { routeHistory: [routePath] });

      const heading = await screen.findByRole("heading", {
        name: headingMatch,
      });

      expect(heading).toBeInTheDocument();
    }
  );
});

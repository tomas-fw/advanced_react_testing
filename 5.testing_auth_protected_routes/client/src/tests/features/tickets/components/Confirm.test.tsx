import { App } from "../../../../App";
import { render } from "../../../../test-utils";

describe("Confirm page", () => {
  const user = {
    email: "test@test.com",
  };

  test("redirect to /tickets/:showId if seat count is missing", async () => {
    const { history } = render(<App />, {
      routeHistory: ["/confirm/0?holdId=12345"],
      preloadedState: { user: { userDetails: user } },
    });

    expect(history.location.pathname).toBe("/tickets/0");
  });
});

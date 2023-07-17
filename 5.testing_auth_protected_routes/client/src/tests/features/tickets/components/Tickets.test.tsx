import { App } from "../../../../App";
import { act, fireEvent, render, screen } from "../../../../test-utils";

describe("Buy tickets component", () => {
  const user = {
    email: "test@test.com",
  };

  test("displays band information when buying tickets", async () => {
    render(<App />, {
      routeHistory: ["/tickets/0"],
      preloadedState: { user: { userDetails: user } },
    });

    const bandHeading = await screen.findByRole("heading", {
      name: /avalanche of cheese/i,
    });
    const availableSeatCount = screen.getByRole("heading", {
      name: /308 seats left/i,
    });

    const purchaseButton = screen.getByRole("button", {
      name: /purchase/i,
    });

    expect(bandHeading).toBeInTheDocument();
    expect(availableSeatCount).toBeInTheDocument();
    expect(purchaseButton).toBeInTheDocument();
  });

  test("'purchase' button pushes the corect URL ", async () => {
    const { history } = render(<App />, {
      routeHistory: ["/tickets/0"],
      preloadedState: { user: { userDetails: user } },
    });

    const purchaseButton = await screen.findByRole("button", {
      name: /purchase/i,
    });

    act(() => {
      fireEvent.click(purchaseButton);
    });
    expect(history.location.pathname).toBe("/confirm/0");

    const searchRegex = expect.stringMatching(/holdId=\d+&seatCount=2/);

    expect(history.location.search).toEqual(searchRegex);
  });
});

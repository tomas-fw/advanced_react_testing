import { Shows } from "../../../../features/tickets/components/Shows";
import { act, fireEvent, render, screen } from "../../../../test-utils";

// name: "Avalanche of Cheese",
//     description: "rollicking country with ambitious kazoo solos",
describe("Shows compontent", () => {
  test("displays all shows from API", async () => {
    render(<Shows />);

    const showsList = await screen.findAllByRole("listitem");

    expect(showsList).toHaveLength(2);
  });

  test("displays relevant shows details for non-sold-out show", async () => {
    render(<Shows />);

    const availableShows = await screen.findByRole("heading", {
      name: /avalanche of cheese/i,
    });
    const buyTicketButton = screen.getByRole("button", { name: "tickets" });

    expect(availableShows).toBeInTheDocument();
    expect(buyTicketButton).toBeInTheDocument();
  });

  test("displays relevant shows details for sold-out show", async () => {
    render(<Shows />);

    const availableShows = await screen.findByRole("heading", {
      name: /the joyous nun riot/i,
    });
    const buyTicketButton = screen.getByRole("heading", { name: /sold out/i });

    expect(availableShows).toBeInTheDocument();
    expect(buyTicketButton).toBeInTheDocument();
  });

  test("redirects to correct ticket URL when 'tickets' is clicked", async () => {
    const { history } = render(<Shows />);

    const buyTicketsButton = await screen.findByRole("button", {
      name: /tickets/i,
    });

    expect(buyTicketsButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(buyTicketsButton);
    });

    expect(history.location.pathname).toBe("/tickets/0");
  });
});

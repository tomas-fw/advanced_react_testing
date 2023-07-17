import { App } from "../../../../App";
import { render, screen } from "../../../../test-utils";

describe("Band component", () => {
  test("band page displays band name of correct name", async () => {
    render(<App />, { routeHistory: ["/bands/0"] });

    const heading = await screen.findByRole("heading", {
      name: /avalanche of cheese/i,
    });

    const image = screen.getByRole("img", { name: "band photo" });

    expect(heading).toBeInTheDocument();
    expect(image).toBeInTheDocument();
  });
});

import userEvent from "@testing-library/user-event";
import {
  DefaultRequestBody,
  RequestParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";

import { App } from "../../../App";
import { baseUrl, endpoints } from "../../../app/axios/constants";
import { handlers } from "../../../mocks/handlers";
import { server } from "../../../mocks/server";
import { act, render, screen, waitFor, within } from "../../../test-utils";

const signInFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(ctx.status(401));
};

const signUpFailure = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(ctx.status(400));
};

const serverError = (
  req: RestRequest<DefaultRequestBody, RequestParams>,
  res: ResponseComposition,
  ctx: RestContext
) => {
  return res(ctx.status(500));
};

describe("Protected routes", () => {
  test.each([
    {
      routeName: "Profile",
      routePath: "/profile",
    },
    {
      routeName: "Tickets",
      routePath: "/tickets/0",
    },
    {
      routeName: "Profile",
      routePath: "/confirm/0?holdId=123&seatCount=2",
    },
  ])("$routeName page redirect to login screen", async ({ routePath }) => {
    const { history } = render(<App />, { routeHistory: [routePath] });

    const heading = await screen.findByRole("heading", {
      name: /sign in to your account/i,
    });

    expect(heading).toBeInTheDocument();
    expect(history.location.pathname).toBe("/signin");
  });

  test.each([
    { name: "sign up", actionButton: /sign up/i },
    { name: "sign in", actionButton: /sign in/i },
  ])("successful $name flow", async ({ actionButton }) => {
    const { history } = render(<App />, { routeHistory: ["/tickets/0"] });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const form = screen.getByTestId("sign-in-form");
    const signInButton = within(form).getByRole("button", {
      name: actionButton,
    });

    await act(async () => {
      await userEvent.type(emailInput, "test@test.com");
      await userEvent.type(passwordInput, "123456");
      userEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(history.location.pathname).toBe("/tickets/0");
      expect(history.entries).toHaveLength(1);
    });
  });

  test.each([
    {
      name: "Sign in Failure",
      responseResolver: signInFailure,
      buttonNameRegex: /sign in/i,
      endpoint: endpoints.signIn,
    },
    {
      name: "Sign in Error",
      responseResolver: serverError,
      buttonNameRegex: /sign in/i,
      endpoint: endpoints.signIn,
    },
    {
      name: "Sign up Failure",
      responseResolver: signUpFailure,
      buttonNameRegex: /sign up/i,
      endpoint: endpoints.signUp,
    },
    {
      name: "Sign up Errorr",
      responseResolver: serverError,
      buttonNameRegex: /sign up/i,
      endpoint: endpoints.signUp,
    },
  ])(
    "$name followed by successful signin",
    async ({ responseResolver, buttonNameRegex, endpoint }) => {
      const errorHandler = rest.post(
        `${baseUrl}/${endpoint}`,
        responseResolver
      );
      server.resetHandlers(...handlers, errorHandler);

      const { history } = render(<App />, { routeHistory: ["/tickets/0"] });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const form = screen.getByTestId("sign-in-form");
      const actionButton = within(form).getByRole("button", {
        name: buttonNameRegex,
      });

      userEvent.type(emailInput, "test@test.com");
      userEvent.type(passwordInput, "123456");
      userEvent.click(actionButton);

      await waitFor(() => {
        expect(history.location.pathname).toBe("/tickets/0");
      });

      server.resetHandlers();
      userEvent.click(actionButton);

      await waitFor(() => {
        expect(history.location.pathname).toBe("/tickets/0");
        expect(history.entries).toHaveLength(1);
      });
    }
  );
});

import {
  render as rtlRender,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import { createMemoryHistory, MemoryHistory } from "history";
import { Provider } from "react-redux";
import { Router } from "react-router";

import { configureStoreWithMiddlewares, RootState } from "../app/store";

type CustomRenderOptions = {
  preloadedState?: RootState;
  routeHistory?: Array<string>;
  initialRouteIndex?: number;
  renderOptions?: Omit<RenderOptions, "wrapper">;
};

type CustomerRenderResults = RenderResult & {
  history: MemoryHistory;
};

const render = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    routeHistory,
    initialRouteIndex,
    ...renderoptions
  }: CustomRenderOptions = {}
): CustomerRenderResults => {
  const history = createMemoryHistory({
    initialEntries: routeHistory,
    initialIndex: initialRouteIndex,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Wrapper: React.FC = ({ children }: Record<string, any>) => {
    const store = configureStoreWithMiddlewares(preloadedState);
    return (
      <Provider store={store}>
        <Router history={history}>{children}</Router>
      </Provider>
    );
  };

  const rtlRenderObject = rtlRender(ui, { wrapper: Wrapper, ...renderoptions });
  return { ...rtlRenderObject, history };
};

export * from "@testing-library/react";
export { render };

import { expectSaga } from "redux-saga-test-plan";

import {
  logErrorToast,
  logErrorToasts,
} from "../../../../features/toast/redux/LogErrorToastSaga";
import { ToastOptions } from "../../../../features/toast/types";

describe("logErrorToastSaga", () => {
  test("saga calls analytics when it receives error toast", () => {
    const errorToastOptions: ToastOptions = {
      status: "error",
      title: "Error Title",
    };

    const errorToastAction = {
      type: "test",
      payload: errorToastOptions,
    };
    return expectSaga(logErrorToasts, errorToastAction)
      .call.fn(logErrorToast)
      .run();
  });

  test("saga do not calls analytics when it receives toast with a status different than analytics", () => {
    const errorToastOptions: ToastOptions = {
      status: "info",
      title: "Error Title",
    };

    const errorToastAction = {
      type: "test",
      payload: errorToastOptions,
    };
    return expectSaga(logErrorToasts, errorToastAction)
      .not.call(logErrorToast, "Info Title")
      .run();
  });
});

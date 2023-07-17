// adapted from https://redux-saga.js.org/docs/advanced/NonBlockingCalls/
import { createMockTask } from "@redux-saga/testing-utils";
import { SagaIterator } from "redux-saga";
import { call, cancel, cancelled, fork, put, take } from "redux-saga/effects";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import { authServerCall } from "../../../../features/auth/api";
import {
  cancelSignIn,
  endSignIn,
  signIn,
  signInRequest,
  signOut,
  startSignIn,
} from "../../../../features/auth/redux/authSlice";
import {
  authenticateUser,
  signInFlow,
} from "../../../../features/auth/redux/signInSaga";
import { LoggedInUser, SignInDetails } from "../../../../features/auth/types";
import { showToast } from "../../../../features/toast/redux/toastSlice";

const signInRequestPayload: SignInDetails = {
  email: "test@test.test",
  password: "abc123",
  action: "signIn",
};

const signUpRequestPayload: SignInDetails = {
  email: "test@test.test",
  password: "abc123",
  action: "signUp",
};

const authServerResponse: LoggedInUser = {
  email: "test@test.test",
  id: 123,
  token: "123456",
};

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const networkProdivers: Array<StaticProvider> = [
  [matchers.call.fn(authServerCall), authServerResponse],
];

describe("signInFlow saga", () => {
  test("successful sign-in", () => {
    return expectSaga(signInFlow)
      .provide(networkProdivers)
      .dispatch(signInRequest(signInRequestPayload))
      .fork(authenticateUser, signInRequestPayload)
      .put(startSignIn())
      .call(authServerCall, signInRequestPayload)
      .put(signIn(authServerResponse)) // partial assertion
      .put(
        showToast({
          title: "Signed in as test@test.test",
          status: "info",
        })
      ) // partial assertion
      .put(endSignIn())
      .silentRun(25); // argument is for timeout in network call
  });

  test("successful sign-up", () => {
    return expectSaga(signInFlow)
      .provide(networkProdivers)
      .dispatch(signInRequest(signUpRequestPayload))
      .fork(authenticateUser, signUpRequestPayload)
      .put(startSignIn())
      .call(authServerCall, signUpRequestPayload)
      .put(signIn(authServerResponse)) // partial assertion
      .put(
        showToast({
          title: "Signed in as test@test.test",
          status: "info",
        })
      ) // partial assertion
      .put(endSignIn())
      .silentRun(25); // argument is for timeout in network call
  });

  test("cancel sign-in", () => {
    return expectSaga(signInFlow)
      .provide({
        call: async (effect, next) => {
          if (effect.fn === authServerCall) {
            await sleep(500);
          }
          next();
        },
      })
      .dispatch(signInRequest(signInRequestPayload))
      .fork(authenticateUser, signInRequestPayload)
      .dispatch(cancelSignIn())
      .put(showToast({ title: "Sign in canceled", status: "warning" }))
      .put(signOut())
      .put(endSignIn())
      .silentRun(25);
  });
  test("sign-in error", () => {
    return expectSaga(signInFlow)
      .provide([
        [
          matchers.call.fn(authServerCall),
          throwError(new Error("test error msg")),
        ],
      ])
      .dispatch(signInRequest(signInRequestPayload))
      .fork(authenticateUser, signInRequestPayload)
      .put(startSignIn())
      .put(
        showToast({
          title: "Sign in failed: test error msg",
          status: "warning",
        })
      )
      .put(endSignIn())
      .silentRun(25);
  });
});

describe("unit test for fork cancelation", () => {
  test("saga cancel flow", () => {
    const task = createMockTask();
    const saga = testSaga(signInFlow);
    saga.next().take(signInRequest.type);
    saga
      .next({ type: "test", payload: signInRequestPayload })
      .fork(authenticateUser, signInRequestPayload);
    saga.next(task).take([cancelSignIn.type, endSignIn.type]);
    saga.next(cancelSignIn()).cancel(task);
  });
  test("saga end flow", () => {
    const saga = testSaga(signInFlow);
    saga.next().take(signInRequest.type);
    saga
      .next({ type: "test", payload: signInRequestPayload })
      .fork(authenticateUser, signInRequestPayload);
    saga.next().take([cancelSignIn.type, endSignIn.type]);
    saga.next(endSignIn()).take(signInRequest.type);
  });
});

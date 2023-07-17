import axios from "axios";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../../../../features/tickets/api";
import {
  cancelTransaction,
  generateErrorToastOptions,
  purchaseTickets,
  ticketFlow,
} from "../../../../features/tickets/redux/ticketSaga";
import {
  endTransaction,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "../../../../features/tickets/redux/ticketSlice";
import { TicketAction } from "../../../../features/tickets/types";
import { showToast } from "../../../../features/toast/redux/toastSlice";
import {
  holdReservation,
  purchasePayload,
  purchaseReservation,
} from "../../../../test-utils/fake-data";

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null],
  [matchers.call.fn(cancelPurchaseServerCall), null],
];

const holdAction = {
  type: "test",
  payload: holdReservation,
};

test("cancelTranscation cancels hold and reset transaction", () => {
  return expectSaga(cancelTransaction, holdReservation)
    .provide(networkProviders)
    .call(releaseServerCall, holdReservation)
    .put(resetTransaction())
    .run();
});

describe("common to all flows", () => {
  test("start with hold call to server", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide(networkProviders)
      .dispatch(
        startTicketAbort({ reservation: holdReservation, reason: "Abort" })
      )
      .call(reserveTicketServerCall, holdReservation)
      .run();
  });

  test("show error toast and clean up after server error", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.fn(reserveTicketServerCall),
          throwError(new Error("test error msg")),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .put(
        showToast(
          generateErrorToastOptions("test error msg", TicketAction.hold)
        )
      )
      .call(cancelTransaction, holdReservation)
      .run();
  });
});

describe("purchase flow", () => {
  test("network error on purchase shows toast and cancels transaction", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.like({
            fn: reserveTicketServerCall,
            args: [purchaseReservation],
          }),
          throwError(new Error("test error msg")),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .dispatch(startTicketPurchase(purchasePayload))
      .call(cancelPurchaseServerCall, purchaseReservation)
      .put(
        showToast(
          generateErrorToastOptions("test error msg", TicketAction.hold)
        )
      )
      .call(cancelTransaction, holdReservation)
      .run();
  });

  test("abort purchase while call to server is running", () => {
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide([...networkProviders, { race: () => ({ abort: true }) }])
      .call(cancelSource.cancel)
      .call(cancelPurchaseServerCall, purchaseReservation)
      .put(showToast({ title: "purchase canceled", status: "warning" }))
      .call(cancelTransaction, holdReservation)
      .not.put(showToast({ title: "tickets purchased", status: "success" }))
      .run();
  });

  test("succefull purchase ticket flow", () => {
    const cancelSource = axios.CancelToken.source();
    return expectSaga(purchaseTickets, purchasePayload, cancelSource)
      .provide(networkProviders)
      .call(reserveTicketServerCall, purchaseReservation, cancelSource.token)
      .put(showToast({ title: "tickets purchased", status: "success" }))
      .call(releaseServerCall, holdReservation)
      .put(endTransaction())
      .not.call.fn(cancelSource.cancel)
      .not.call.fn(cancelPurchaseServerCall)
      .not.put(showToast({ title: "purchase canceled", status: "warning" }))
      .run();
  });
});

describe("hold cancellation", () => {
  test.each([
    { name: "cancel", actionCreator: startTicketRelease },
    { name: "abort", actionCreator: startTicketAbort },
  ])(
    "cancels hold and resets ticket transaction on cancel $name",
    async ({ actionCreator }) => {
      return expectSaga(ticketFlow, holdAction)
        .provide(networkProviders)
        .dispatch(
          actionCreator({ reason: "test", reservation: holdReservation })
        )
        .call(releaseServerCall, holdReservation)
        .call(cancelTransaction, holdReservation)
        .run();
    }
  );

  //   test("cancels hold and resets ticket transaction when user navigates away from page", () => {
  //     return expectSaga(ticketFlow, holdAction)
  //       .provide(networkProviders)
  //       .dispatch(
  //         startTicketAbort({ reason: "test", reservation: holdReservation })
  //       )
  //       .call(releaseServerCall, holdReservation)
  //       .call(cancelTransaction, holdReservation)
  //       .run();
  //   });
});

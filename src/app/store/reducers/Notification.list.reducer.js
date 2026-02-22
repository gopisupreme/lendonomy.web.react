import * as types from "../actionTypes/Notification.list.actionTypes";
import { updateObject } from "../storeUtils";

const initialState = {
  NotificationCount: {},
};

export default function (state = initialState, action) {
  let newState = {};
  switch (action.type) {
    case types.NOTIFICATION_COUNT_REQUEST:
      return updateObject(state, {
        NotificationCount: action.payload,
      });

    default:
      return state;
  }
}

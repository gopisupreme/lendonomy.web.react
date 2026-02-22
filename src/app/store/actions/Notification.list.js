import * as AccountListActionTypes from "app/store/actionTypes/Notification.list.actionTypes";

export const NotificationCount = (values = {}) => ({
  type: AccountListActionTypes.NOTIFICATION_COUNT_REQUEST,
  payload: values,
});

export default {
  NotificationCount,
};

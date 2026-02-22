import * as AnalyticsActionTypes from 'app/store/actionTypes/analytics.actionTypes'

export const getAnalytics = (values = {}) => ({
  type: AnalyticsActionTypes.GET_ANALYTICS_REQUEST,
  payload: values,
})

export const analyticsError = (data) => ({
  type: AnalyticsActionTypes.GET_ANALYTICS_ERROR,
  data,
})
export const analyticsSucc = (data) => ({
  type: AnalyticsActionTypes.GET_ANALYTICS_SUCCESS,
  data,
})

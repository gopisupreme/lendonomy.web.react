import { applyMiddleware, createStore, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import allReducers from 'app/store/reducers/index';
import Sagas from 'app/store/sagas/index';

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(
    allReducers,
    composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(Sagas);

export default store;

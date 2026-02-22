import {Storagehelper} from 'app/common/shared/utils';
import React from 'react';
import {Redirect, Route} from 'react-router-dom';

export const PrivateRoute = ({component: Component, ...rest}) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        // loginState.isAuthed ? (
        Storagehelper.getAccessToken() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{pathname: '/login', state: {from: props.location}}} />
        )
      }
    />
  );
};

export const PublicRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={(props) =>
      !Storagehelper.getAccessToken() ? (
        <Component {...props} />
      ) : (
        <Redirect to='/' />
      )
    }
  />
);

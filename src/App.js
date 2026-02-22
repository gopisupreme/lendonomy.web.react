import React from 'react';

import ScrollToTop from 'app/common/shared/scroll-top';
import history from 'app/common/shared/history';
import 'assets/styles/style.scss';
import AppLoader from './app/common/components/AppLoader/AppLoader';
// import './App.css';

//import 'primeflex/primeflex.css';
import {Router, Route} from 'react-router-dom';
import {Routes} from 'app/pages/routes';

function App() {
  return (
    <>
      <AppLoader />
      <Router history={history}>
        <>
          <ScrollToTop />
          <Route component={Routes} />
        </>
      </Router>
    </>
  );
}

export default App;

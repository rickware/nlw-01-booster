import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';
import WebPoints from './pages/ManagePoint/Points';
import WebDetais from './pages/ManagePoint/Detail';

const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={CreatePoint} path="/create-point" />
      <Route component={WebPoints} path="/manage-point" />
      <Route component={WebDetais} path="/webDetail" />
    </BrowserRouter>
  );
}

export default Routes;
import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';
import ManagePoints from './pages/ManagePoint/Points';
import ManageDetais from './pages/ManagePoint/Detail';

const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={CreatePoint} path="/create-point" />
      <Route component={ManagePoints} path="/manage-point" />
      <Route component={ManageDetais} path="/webDetail/:id" />
    </BrowserRouter>
  );
}

export default Routes;
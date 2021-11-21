import React, { Component } from 'react';
import Overview from './components/Overview';
import Details from "./components/Details";
import Profile from './components/Profile';
import {
  Switch,
  Route
} from "react-router-dom";


class App extends Component {
  render() {
    return (
      <Switch>
        <Route path="/details/:SGroupID">
          <Details/>
        </Route>
        <Route path="/profile">
          <Profile/>
        </Route>
        <Route path="/">
          <Overview/>
        </Route>
      </Switch>
    );
  }
}

export default App;

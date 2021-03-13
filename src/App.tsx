import React from 'react';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import {Home, About} from './views';

const App = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/about'>About</Link></li>
        </ul>
      </nav>
      <Switch>
        <Route path='/about'><About /></Route>
        <Route path='/'><Home /></Route>
      </Switch>
    </div>
  </Router>
);

export default App;

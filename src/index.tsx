import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

import blue from '@material-ui/core/colors/lightBlue';

const theme = () => {
  return (createMuiTheme({
    palette: {
      primary: {
        ...blue,
        '500': '#01579B'
      }
    }
  }));
}

ReactDOM.render(
  <React.StrictMode>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

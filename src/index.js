import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Mobile from './Mobile';

const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;

ReactDOM.render(
  <React.StrictMode>
    {isMobile ? <Mobile /> : <App />}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

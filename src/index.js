import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './Routes/AppRoutes';
import { CardStorageProviderComponent } from './Hooks/useCardStorage';
import { FirebaseProviderComponent } from './Hooks/useFirebase';

ReactDOM.render(
  <React.StrictMode>
    <CardStorageProviderComponent>
      <FirebaseProviderComponent>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </FirebaseProviderComponent>
    </CardStorageProviderComponent>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

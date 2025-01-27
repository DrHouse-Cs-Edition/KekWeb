import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from  'react-router-dom'
import DisableDevtool from 'disable-devtool';

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log("envvar1: ", process.env.REACT_APP_JWT_KEY);

if(process.env.NODE_ENV === 'production'){
  console.log("disabling devTools");
  //DisableDevtool();
}
//const user_id = fai_login_e_ottieni_id()
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

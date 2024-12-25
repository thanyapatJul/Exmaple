import React from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';



const container = document.getElementById('root');
const root = createRoot(container); 
root.render(
    <React.StrictMode>
        <RecoilRoot>
            <App />
        </RecoilRoot>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import { createRoot } from 'react-dom/client';
import Layout from './views/Layout';
import React from 'react';
import './global.scss';

const root = createRoot(document.body);
root.render(
  <React.StrictMode>
    <Layout />
  </React.StrictMode>
);

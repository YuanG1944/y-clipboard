import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from '@/views/Layout';

import './global.scss';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Layout />
  </React.StrictMode>
);

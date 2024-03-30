import { FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import ClipHistoryBoard from '../ClipHistoryBoard';
import ConfigMenu from '../ConfigMenu';

const Layout: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ClipHistoryBoard />} />
      <Route path="/config" element={<ConfigMenu />} />
    </Routes>
  );
};

export default Layout;

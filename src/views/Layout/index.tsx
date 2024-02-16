import { FC } from 'react';
import styles from './index.module.scss';
import ClipHistoryBoard from '@/views/ClipHistoryBoard';

const Layout: FC = () => {
  return (
    <div className={styles.layout}>
      <ClipHistoryBoard />
    </div>
  );
};
export default Layout;

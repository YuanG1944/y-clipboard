import { FC } from 'react';

import NavBar from '@/components/NavBar';

import styles from './index.module.scss';
import ClipCard from '@/components/ClipCard';
import { useClipHistoryBoard } from './index.hooks';

const ClipHistoryBoard: FC = () => {
  const {
    handleFocus,
    handleClick,
    handleDoubleClick,
    handleBlankSpace,
    currId,
    historyCtx,
    currIndex,
  } = useClipHistoryBoard();

  return (
    <>
      <div className={styles.blankSpace} onClick={handleBlankSpace}></div>

      <div className={styles.clipHistoryBoard}>
        <div className={styles.navBar}>
          <NavBar checkFocus={handleFocus} />
        </div>
        <div className={styles.contents}>
          {historyCtx.map((ctx, idx) => (
            <ClipCard
              currId={currId}
              context={ctx}
              id={`clip-${idx}`}
              key={ctx.id}
              onClick={handleClick(ctx.id)}
              onDoubleClick={handleDoubleClick}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ClipHistoryBoard;

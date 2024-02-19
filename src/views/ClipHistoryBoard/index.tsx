import { FC, useEffect, useState } from 'react';

import NavBar from '@/components/NavBar';

import styles from './index.module.scss';
import ClipCard from '@/components/ClipCard';
import QueueAnim from 'rc-queue-anim';
import { useKeyPress } from 'ahooks';
import { ActiveEnum, StorageItem } from '@/actions/clipboard/type';

const ClipHistoryBoard: FC = () => {
  const [historyCtx, setHistoryCtx] = useState<StorageItem[]>([]);
  const [preHistoryCtx, setPreviewHistoryCtx] = useState<StorageItem[][]>([]);
  const [currIndex, setCurrIndex] = useState<number | string>(-1);
  const [currId, setCurrId] = useState<string>('');
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);

  /**
   * Make sure currIndex change to rerender dom
   * @param num
   * @returns num | string
   */
  const setCurrIndexChange = (num: number | string) => {
    if (typeof currIndex === 'number') {
      return String(num);
    }
    if (typeof num === 'string') {
      return Number(num);
    }
  };

  const handleAnchor = (id: string) => {
    if (id) {
      const currClipDom = document?.querySelector(`#${id}`);
      currClipDom &&
        currClipDom.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  const handleBridge = () => {
    const arr = window?.eBridge?.getClipHistory() as StorageItem[];
    if (arr?.length) {
      setHistoryCtx(arr);
      setTimeout(() => {
        setCurrIndex(setCurrIndexChange('0'));
      }, 100);
    }
  };

  const handleVisibility = () => {
    if (!document.hidden) {
      setTimeout(() => {
        setShow(true);
      }, 400);
      handleBridge();
    }
  };

  const handleClick = (currId: string) => () => {
    const idx = historyCtx.findIndex((ctx) => ctx.id === currId);
    if (idx !== -1) {
      setCurrIndex(setCurrIndexChange(idx));
    }
  };

  const sendingPaste = () => {
    if (!focus) {
      window?.eBridge?.setStoreValue(historyCtx);
      window?.eBridge?.writeSelected(currId);
      window?.eBridge?.paste();
      setShow(false);
    }
  };

  const hideWindow = () => {
    setShow(false);
    window?.eBridge?.hideWindow();
    window?.eBridge?.setStoreValue(historyCtx);
  };

  const sendingExit = () => {
    if (!focus) {
      hideWindow();
    }
  };

  const handleDoubleClick = () => {
    sendingPaste();
  };

  const handleFocus = (isFocus: boolean) => {
    setFocus(isFocus);
  };

  const handleBlankSpace = () => {
    hideWindow();
  };

  const handleActiveChange = (act: ActiveEnum) => {
    const ctx = historyCtx.map((it) => {
      if (it.id === currId) {
        return {
          ...it,
          defaultActive: act,
        };
      }
      return it;
    });
    setHistoryCtx(ctx);
  };

  useKeyPress('rightarrow', () => {
    setCurrIndex((num) => {
      if (!focus && Number(num) < historyCtx.length - 1) {
        return Number(num) + 1;
      }
      return setCurrIndexChange(num);
    });
  });

  useKeyPress('leftarrow', () => {
    setCurrIndex((num) => {
      if (!focus && Number(num) > 0) {
        return Number(num) - 1;
      }
      return setCurrIndexChange(num);
    });
  });

  useKeyPress('enter', () => {
    sendingPaste();
  });

  useKeyPress('esc', () => {
    sendingExit();
  });

  useKeyPress('backspace', () => {
    if (!focus) {
      setPreviewHistoryCtx((arr) => [...arr, historyCtx]);
      setHistoryCtx((ctx) => ctx.filter((item) => currId !== item.id));
      setCurrIndex((num) => {
        if (Number(num) > 0) {
          return Number(num) - 1;
        }
        return setCurrIndexChange(num);
      });
    }
  });

  useKeyPress(['meta.z', 'ctrl.z'], () => {
    if (!focus) {
      if (!preHistoryCtx.length) return;
      setHistoryCtx(preHistoryCtx.slice(-1)[0]);
      setPreviewHistoryCtx((arr) => arr.slice(0, -1));
    }
  });

  useEffect(() => {
    const id = historyCtx?.[Number(currIndex)]?.id || '';
    handleAnchor(`clip-${currIndex}`);
    setCurrId(id);
  }, [currIndex]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <>
      <div className={styles.blankSpace} onClick={handleBlankSpace}></div>
      <QueueAnim className={styles.animateLayout} type={'bottom'} ease={'easeInOutQuart'} key="ani">
        {show ? (
          <div className={styles.clipHistoryBoard} key="aniBar">
            <div className={styles.navBar}>
              <NavBar checkFocus={handleFocus} />
            </div>
            <div className={styles.contents} key="aniCard">
              {historyCtx.map((ctx, idx) => (
                <ClipCard
                  currId={currId}
                  context={ctx}
                  id={`clip-${idx}`}
                  key={ctx.id}
                  navFocus={focus}
                  onClick={handleClick(ctx.id)}
                  onDoubleClick={handleDoubleClick}
                  onActiveChange={handleActiveChange}
                />
              ))}
            </div>
          </div>
        ) : null}
      </QueueAnim>
    </>
  );
};

export default ClipHistoryBoard;

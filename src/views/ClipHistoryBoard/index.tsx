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
  const [currIndex, setCurrIndex] = useState(-1);
  const [currId, setCurrId] = useState<string>('');
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);

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
        setCurrIndex(0);
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
    const idx = historyCtx.findIndex(ctx => ctx.id === currId);
    if (idx !== -1) {
      setCurrIndex(idx);
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
    const ctx = historyCtx.map(it => {
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
    setCurrIndex(num => {
      if (!focus && num < historyCtx.length - 1) {
        return num + 1;
      }
      return num;
    });
  });

  useKeyPress('leftarrow', () => {
    setCurrIndex(num => {
      if (!focus && num > 0) {
        return num - 1;
      }
      return num;
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
      setPreviewHistoryCtx(arr => [...arr, historyCtx]);
      setHistoryCtx(ctx => ctx.filter(item => currId !== item.id));
      setCurrIndex(num => {
        if (num > 0) {
          return num - 1;
        }
        return 1;
      });
    }
  });

  useKeyPress(['meta.z', 'ctrl.z'], () => {
    if (!focus) {
      if (!preHistoryCtx.length) return;
      setHistoryCtx(preHistoryCtx.slice(-1)[0]);
      setPreviewHistoryCtx(arr => arr.slice(0, -1));
    }
  });

  useEffect(() => {
    const id = historyCtx?.[currIndex]?.id || '';
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
      <QueueAnim className={styles.animateLayout} type={'bottom'} ease={'easeInOutQuart'} key='ani'>
        {show ? (
          <div className={styles.clipHistoryBoard} key='aniBar'>
            <div className={styles.navBar}>
              <NavBar checkFocus={handleFocus} />
            </div>
            <div className={styles.contents} key='aniCard'>
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

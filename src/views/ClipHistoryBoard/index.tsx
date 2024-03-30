import { FC, useEffect, useState } from 'react';
import QueueAnim from 'rc-queue-anim';
import { useKeyPress } from 'ahooks';

import styles from './index.module.scss';

import NavBar from '@/components/NavBar';
import ClipCard from '@/components/ClipCard';
import Windows from '@/actions/windows';
import { ActiveEnum, StorageItem } from '@/actions/clipboard/type';

import { os } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { getHistory, paste, setHistoryStr, writeSelected } from '@/actions/clipboard';

const windows = Windows.getInstance();

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
    return Number(num);
  };

  const handleAnchor = (id: string) => {
    if (id) {
      const currClipDom = document?.querySelector(`#${id}`);
      currClipDom &&
        currClipDom.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  };

  const handleBridge = async () => {
    const clipboardHistory = await getHistory();
    if (clipboardHistory?.length) {
      setHistoryCtx(clipboardHistory);
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

  const win32VisibilityChange = async () => {
    handleVisibility();
    os.platform().then((platform) => {
      if (platform !== 'win32') return;
      appWindow.onFocusChanged((act) => {
        if (act.event === 'tauri://focus' && !show) {
          handleVisibility();
        }
      });
    });
  };

  const handleClick = (currId: string) => () => {
    const idx = historyCtx.findIndex((ctx) => ctx.id === currId);
    if (idx !== -1) {
      setCurrIndex(setCurrIndexChange(idx));
    }
  };

  const sendingPaste = async () => {
    if (!focus) {
      setHistoryStr(historyCtx, currId);
      writeSelected(historyCtx, currId);
      windows.hide();
      setShow(false);
      setTimeout(() => {
        paste();
      }, 200);
    }
  };

  const hideWindow = () => {
    os.platform().then((platform) => {
      setShow(false);
      if (platform === 'darwin') {
        windows.hideWithSwitchApp();
      } else {
        windows.hide();
      }
      setHistoryStr(historyCtx);
    });
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
    win32VisibilityChange();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div className={styles.clipLayout}>
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
                  onClick={handleClick(ctx.id!)}
                  onDoubleClick={handleDoubleClick}
                  onActiveChange={handleActiveChange}
                />
              ))}
            </div>
          </div>
        ) : null}
      </QueueAnim>
    </div>
  );
};

export default ClipHistoryBoard;

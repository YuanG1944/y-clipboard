import { FC, useEffect, useRef, useState } from 'react';
import QueueAnim from 'rc-queue-anim';
import { useKeyPress } from 'ahooks';

import styles from './index.module.scss';

import NavBar from '@/components/NavBar';
import ClipCard from '@/components/ClipCard';
import Windows from '@/actions/windows';
import { ActiveEnum, StorageItem } from '@/actions/clipboard/type';

import { os } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import {
  deleteItems,
  getHistoryByPage,
  paste,
  updateCreateTime,
  writeSelected,
} from '@/actions/clipboard';
import loadingAnim from '@/assets/loading-anim.gif';

const windows = Windows.getInstance();

const ClipHistoryBoard: FC = () => {
  const [historyCtx, setHistoryCtx] = useState<StorageItem[]>([]);
  const [preHistoryCtx, setPreviewHistoryCtx] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState<number | string>(-1);
  const [currId, setCurrId] = useState<string>('');
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(10);
  const cardContentRef = useRef<HTMLDivElement>(null);

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

  const resetPage = () => {
    setPage(2);
    setPageSize(10);
  };

  const handleBridge = async () => {
    const clipboardHistory = (await getHistoryByPage(1, 20)) ?? [];
    setHistoryCtx(clipboardHistory);
    setPreviewHistoryCtx([]);
    resetPage();
    setTimeout(() => {
      setCurrIndex(setCurrIndexChange('0'));
    }, 100);
  };

  const loadMoreInfo = async () => {
    setLoading(true);
    try {
      const clipboardHistory = (await getHistoryByPage(page, pageSize)) ?? [];
      if (clipboardHistory.length) {
        setHistoryCtx((arr) => [...arr, ...clipboardHistory]);
        setPage((num) => num + 1);
      }
    } catch (error) {
      console.error('Loading Fail');
    } finally {
      setLoading(false);
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
      updateCreateTime(currId);
      deleteItems(preHistoryCtx);
      writeSelected(historyCtx, currId);
      windows.hide();
      setShow(false);
      setTimeout(async () => {
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
      deleteItems(preHistoryCtx);
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

  const handleActiveChange = (act: ActiveEnum, id: string) => {
    const ctx = historyCtx.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          defaultActive: act,
        };
      }
      return it;
    });
    setHistoryCtx(ctx);
  };

  const handleScrollingEvent = () => {
    const scrollLeft = cardContentRef.current!.scrollLeft; // 获取当前的水平滚动位置
    const scrollWidth = cardContentRef.current!.scrollWidth; // 获取元素的总滚动宽度
    const clientWidth = cardContentRef.current!.clientWidth; // 获取元素的视口宽度

    if (scrollLeft + clientWidth >= scrollWidth - 20) {
      loadMoreInfo();
    }
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
      setPreviewHistoryCtx((arr) => [...arr, currId]);
      setHistoryCtx((ctx) =>
        ctx.map((item) => {
          if (item.id === currId) {
            return {
              ...item,
              deleted: true,
            };
          }
          return item;
        }),
      );

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
      setHistoryCtx((ctx) =>
        ctx.map((item) => {
          const last = preHistoryCtx.length - 1;
          if (item.id === preHistoryCtx[last]) {
            return {
              ...item,
              deleted: false,
            };
          }
          return item;
        }),
      );

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

  useEffect(() => {
    console.info('current-->', cardContentRef.current);
    if (cardContentRef.current) {
      cardContentRef.current.addEventListener('scroll', handleScrollingEvent);
    }
    return () => {
      cardContentRef.current?.removeEventListener('scroll', handleScrollingEvent);
    };
  }, [cardContentRef.current]);

  return (
    <div className={styles.clipLayout}>
      <div className={styles.blankSpace} onClick={handleBlankSpace}></div>
      <QueueAnim className={styles.animateLayout} type={'bottom'} ease={'easeInOutQuart'} key="ani">
        {show ? (
          <div className={styles.clipHistoryBoard} key="aniBar">
            <div className={styles.navBar}>
              <NavBar checkFocus={handleFocus} />
            </div>
            <div ref={cardContentRef} className={styles.contents} key="aniCard">
              {historyCtx
                .filter((ctx) => ctx.deleted !== true)
                .map((ctx, idx) => (
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
              {loading && (
                <div className={styles.loadingImg}>
                  <img style={{ width: '40px' }} src={loadingAnim} alt="loading-alt" />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </QueueAnim>
    </div>
  );
};

export default ClipHistoryBoard;

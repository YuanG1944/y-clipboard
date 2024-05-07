import { FC, useEffect, useRef, useState } from 'react';
import QueueAnim from 'rc-queue-anim';
import { useKeyPress } from 'ahooks';

import styles from './index.module.scss';

import NavBar from '@/components/NavBar';
import ClipCard from '@/components/ClipCard';
import Windows from '@/actions/windows';
import { ActiveEnum, ITag, StorageItem } from '@/actions/clipboard/type';

import { os } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import {
  deleteItems,
  findHistories,
  getTagsAll,
  paste,
  updateActive,
  updateCreateTime,
  writeSelected,
} from '@/actions/clipboard';
import loadingAnim from '@/assets/loading-anim.gif';
import { getWheelDirection, WheelEnum } from '@/actions/datamanage';

const windows = Windows.getInstance();

const ClipHistoryBoard: FC = () => {
  const [historyCtx, setHistoryCtx] = useState<StorageItem[]>([]);
  const [preHistoryCtx, setPreviewHistoryCtx] = useState<string[]>([]);
  const [formatActMap, setFormatActMap] = useState<Record<string, string>>({});
  const [currIndex, setCurrIndex] = useState<number | string>(-1);
  const [currId, setCurrId] = useState<string>('');
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const page = useRef(1);
  const queryKeyRef = useRef('');
  const tagIdRef = useRef('');
  const [queryKey, setQueryKey] = useState('');
  const [tagId, setTagId] = useState('');

  const scrollD = useRef(WheelEnum.NORMAL);
  const [pageSize, setPageSize] = useState(10);
  const cardContentRef = useRef<HTMLDivElement>(null);

  const [tags, setTags] = useState<ITag[]>([]);

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
        currClipDom.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  const resetPage = () => {
    page.current = 1;
    setPageSize(10);
  };

  const resetQueryKey = () => {
    queryKeyRef.current = '';
    setQueryKey('');
  };

  const handleBridge = async () => {
    resetPage();
    const clipboardHistory =
      (await findHistories({
        key: queryKey,
        tag: tagId,
        page: 1,
        page_size: pageSize,
      })) ?? [];
    setHistoryCtx([...clipboardHistory]);
    setPreviewHistoryCtx([]);
    setTimeout(() => {
      setCurrIndex(setCurrIndexChange('0'));
    }, 100);
  };

  const loadMoreInfo = async () => {
    setLoading(true);
    try {
      const clipboardHistory =
        (await findHistories({
          key: queryKeyRef.current,
          tag: tagIdRef.current,
          page: page.current + 1,
          page_size: pageSize,
        })) ?? [];

      if (clipboardHistory.length) {
        setHistoryCtx((arr) => [...arr, ...clipboardHistory]);
        page.current += 1;
      }
    } catch (error) {
      console.error('Loading Fail');
    } finally {
      setLoading(false);
    }
  };

  const handleConfig = () => {
    getWheelDirection().then((wheelVal) => {
      scrollD.current = wheelVal as WheelEnum;
    });
  };

  const handleVisibility = () => {
    if (!document.hidden) {
      setTimeout(() => {
        setShow(true);
      }, 150);
      resetQueryKey();
      handleBridge();
      handleConfig();
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

  const handleWheelScroll = (event: WheelEvent) => {
    if (scrollD.current === WheelEnum.NORMAL) return;
    if (!event.ctrlKey && cardContentRef.current && scrollD.current === WheelEnum.REVERSE) {
      event.preventDefault();
      const newScrollPosition = cardContentRef.current.scrollLeft + event.deltaY;
      cardContentRef.current.scrollLeft = newScrollPosition;
    }
  };

  const reloadActive = () => {
    const keys = Object.keys(formatActMap);
    if (!keys.length) return;

    const pr = keys.map((key) => {
      return updateActive(key, formatActMap[key]);
    });

    Promise.all(pr).finally(() => {
      setFormatActMap({});
    });
  };

  const sendingPaste = async () => {
    if (!focus) {
      updateCreateTime(currId);
      deleteItems(preHistoryCtx);
      writeSelected(historyCtx, currId, formatActMap);
      reloadActive();
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
      reloadActive();
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
    setFormatActMap((f) => ({ ...f, [id]: act }));
  };

  const handleScrollingEvent = () => {
    // get scroll position
    const scrollLeft = cardContentRef.current!.scrollLeft;
    // get scroll width
    const scrollWidth = cardContentRef.current!.scrollWidth;
    // get view width
    const clientWidth = cardContentRef.current!.clientWidth;

    if (scrollLeft && scrollLeft + clientWidth >= scrollWidth - 20) {
      loadMoreInfo();
    }
  };

  const reloadTags = async () => {
    try {
      const t = await getTagsAll();
      setTags(t);
      return t;
    } catch (_) {
      return tags;
    }
  };

  useKeyPress('rightarrow', () => {
    setCurrIndex((num) => {
      if (!focus && Number(num) < historyCtx.filter((ctx) => ctx.deleted !== true).length - 1) {
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

  const handleSelected = (tag: ITag | null) => {
    if (tag) {
      tagIdRef.current = tag.id;
      return setTagId(tag.id);
    }
    tagIdRef.current = '';
    return setTagId('');
  };

  const handleSearched = (value: string) => {
    queryKeyRef.current = value;
    setQueryKey(value);
  };

  useEffect(() => {
    const id = historyCtx.filter((ctx) => ctx.deleted !== true)?.[Number(currIndex)]?.id || '';
    handleAnchor(`clip-${currIndex}`);
    setCurrId(id);
  }, [currIndex]);

  useEffect(() => {
    handleBridge();
  }, [tagId, queryKey]);

  useEffect(() => {
    win32VisibilityChange();
    reloadTags();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (cardContentRef.current) {
      cardContentRef.current.addEventListener('scroll', handleScrollingEvent);
      document.addEventListener('wheel', handleWheelScroll, { passive: false });
    }
    return () => {
      cardContentRef.current?.removeEventListener('scroll', handleScrollingEvent);
      document.removeEventListener('wheel', handleWheelScroll);
    };
  }, [cardContentRef.current]);

  return (
    <div className={styles.clipLayout}>
      <div className={styles.blankSpace} onClick={handleBlankSpace}></div>
      <QueueAnim className={styles.animateLayout} type={'bottom'} ease={'easeInOutQuart'} key="ani">
        {show ? (
          <div className={styles.clipHistoryBoard} key="aniBar">
            <div className={styles.navBar}>
              <NavBar
                checkFocus={handleFocus}
                onSelectedTagChange={handleSelected}
                onSearchChange={handleSearched}
              />
            </div>
            <div ref={cardContentRef} className={styles.contents} key="aniCard">
              {historyCtx
                .filter((ctx) => ctx.deleted !== true)
                .map((ctx, idx) => (
                  <ClipCard
                    currId={currId}
                    context={ctx}
                    tags={tags}
                    id={`clip-${idx}`}
                    key={`${ctx.id}clip-${idx}`}
                    queryText={queryKey}
                    navFocus={focus}
                    onClick={handleClick(ctx.id!)}
                    onDoubleClick={handleDoubleClick}
                    onActiveChange={handleActiveChange}
                    reloadTags={reloadTags}
                    onExit={hideWindow}
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

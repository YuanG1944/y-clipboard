import { StorageItem } from '@/actions/clipboard/type';
import { useKeyPress } from 'ahooks';
import { useEffect, useState } from 'react';

export const useClipHistoryBoard = () => {
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
      setCurrIndex(0);
    }
  };

  const handleVisibility = () => {
    if (!document.hidden) {
      setTimeout(() => {
        setShow(true);
      }, 400);
      handleBridge();
    } else {
      setShow(false);
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
      window?.eBridge?.writeSelected(currId);
      window?.eBridge?.paste();
      window?.eBridge?.setStoreValue([]);
    }
  };

  const hideWindow = () => {
    window?.eBridge?.hideWindow();
    window?.eBridge?.setStoreValue([]);
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

  return {
    historyCtx,
    currIndex,
    currId,
    focus,
    show,

    handleVisibility,
    handleClick,
    handleDoubleClick,
    handleFocus,
    handleBlankSpace,
  };
};

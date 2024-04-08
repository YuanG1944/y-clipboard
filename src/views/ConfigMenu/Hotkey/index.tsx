import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, message } from 'antd';
import styles from './index.module.scss';
import { useEventListener } from 'ahooks';
import {
  darwinDefaultKey,
  functionKeyArray,
  IKeyCode,
  UselessKeyArray,
  winDefaultKey,
} from '@/utils/keyMap';
import { os } from '@tauri-apps/api';
import { getStore, hasKeyStore, setStore } from '@/utils/localStorage';
import { setPaste } from '@/actions/shortcut';

export enum StoreKeyEnum {
  KEYCODE = 'KEYCODE',
}

export interface FormValue {
  paste: string;
  pasteCode: string;
}

const App: React.FC = () => {
  const [monitorVal, setMonitorVal] = useState(false);
  const [keyArr, setKeyArr] = useState<number[]>([]);
  const [keyValue, setKeyValue] = useState<string[]>([]);
  const [form] = Form.useForm<FormValue>();

  const [messageApi, contextHolder] = message.useMessage();

  const resetKeyArr = () => {
    setKeyArr([]);
    setKeyValue([]);
  };

  const setFunctionKey = (ev: KeyboardEvent, reset: boolean) => {
    if (keyArr.includes(229)) {
      resetKeyArr();
      return;
    }
    if (keyArr.length && keyArr[keyArr.length - 1] === ev.keyCode) {
      resetKeyArr();
      return;
    }
    if (functionKeyArray.includes(String(ev.keyCode))) {
      if (reset) {
        setKeyArr([ev.keyCode]);
        setKeyValue([ev.code]);
        return;
      }
      setKeyArr((val) => [...val, ev.keyCode]);
      setKeyValue((val) => [...val, ev.code]);
    }
    return;
  };

  const setOtherKey = (ev: KeyboardEvent, reset: boolean) => {
    if (keyArr.includes(229)) {
      resetKeyArr();
      return;
    }
    if (keyArr.length && !functionKeyArray.includes(String(keyArr[keyArr.length - 1]))) {
      resetKeyArr();
      return;
    }
    if (!functionKeyArray.includes(String(ev.keyCode))) {
      if (reset) {
        resetKeyArr();
        return;
      }
      setKeyArr((val) => [...val, ev.keyCode]);
      setKeyValue((val) => [...val, ev.code]);
    }
    return;
  };

  const changeKeyValue = (ev: KeyboardEvent) => {
    if (UselessKeyArray.includes(String(ev.keyCode))) {
      resetKeyArr();
      return;
    }

    const tempKeyArr = [...keyArr, ev.keyCode];
    switch (tempKeyArr.length) {
      case 1:
        setFunctionKey(ev, true);
        return;
      case 2:
        setFunctionKey(ev, false);
        setOtherKey(ev, false);
        return;
      case 3:
        setFunctionKey(ev, true);
        setOtherKey(ev, false);
        return;
      default:
        resetKeyArr();
        return;
    }
  };

  const handleChange = (event: { target: { value: string } }) => {
    if (!event.target.value) {
      resetKeyArr();
    }
  };

  const saveKeycode = () => {
    setStore(StoreKeyEnum.KEYCODE, {
      code: keyArr,
      value: keyValue,
    });
    setPaste(keyArr?.join('+'));
  };

  const initFormValue = () => {
    os.platform().then((platform) => {
      let code, value;
      if (hasKeyStore(StoreKeyEnum.KEYCODE)) {
        code = (getStore(StoreKeyEnum.KEYCODE) as IKeyCode).code;
        value = (getStore(StoreKeyEnum.KEYCODE) as IKeyCode).value;
      } else {
        if (platform === 'darwin') {
          code = darwinDefaultKey.code;
          value = darwinDefaultKey.value;
          setStore(StoreKeyEnum.KEYCODE, darwinDefaultKey);
        } else {
          code = winDefaultKey.code;
          value = winDefaultKey.value;
          setStore(StoreKeyEnum.KEYCODE, winDefaultKey);
        }
      }

      setKeyArr(code);
      setKeyValue(value);

      form.setFieldsValue({
        paste: value?.join('+'),
        pasteCode: code?.join('+'),
      });

      setPaste(code?.join('+'));
    });
  };

  const judgeKeyValid = (value: number[]) => {
    if (value.length >= 2 && !functionKeyArray.includes(String(value[value.length - 1]))) {
      return true;
    }
    return false;
  };

  const handleMonitor = (val: boolean) => {
    if (!val) {
      if (judgeKeyValid(keyArr)) {
        setMonitorVal(val);
        saveKeycode();
        return;
      }

      messageApi.open({
        type: 'error',
        content: 'Invalid hotkey formatting, please reset',
      });

      return;
    }

    if (val) {
      setMonitorVal(val);
      return;
    }
  };

  useEventListener('keydown', (ev) => {
    if (monitorVal) {
      changeKeyValue(ev);
    }
  });

  useEffect(() => {
    initFormValue();
  }, []);

  return (
    <>
      <div className={styles.hotkey}>
        <Form form={form}>
          <Form.Item label="Paste Hotkey" name="paste" required>
            <div className={styles.inputGroup}>
              <Input
                value={keyValue.join('+')}
                onChange={handleChange}
                placeholder="Please input paste hotkey"
                disabled={!monitorVal}
                allowClear
              />
              <Switch
                style={{ marginLeft: '12px' }}
                size="small"
                value={monitorVal}
                onChange={handleMonitor}
              />
            </div>
          </Form.Item>
        </Form>
      </div>
      {contextHolder}
    </>
  );
};

export default App;

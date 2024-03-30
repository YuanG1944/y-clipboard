import { FC, useEffect, useState } from 'react';
import { Button } from 'antd';

import styles from './index.module.scss';
import { ActiveEnum, ActiveTitle, StorageItem } from '@/actions/clipboard/type';
import { useKeyPress } from 'ahooks';
import dayjs from 'dayjs';

export interface ICardTitle {
  id: string;
  currId: string;
  context: StorageItem;
  focus: boolean;
  navFocus: boolean;
  onActiveChange?: (act: ActiveEnum) => void;
  onSwitchChange?: () => void;
}

export interface ITitleActive {
  title: string;
  active: boolean;
  tag: ActiveEnum;
}

const CardTitle: FC<ICardTitle> = ({
  context,
  focus,
  currId,
  navFocus,
  onActiveChange,
  onSwitchChange,
}) => {
  const [titleList, setTitleList] = useState<ITitleActive[]>([]);
  const [activeEnum, setActiveEnum] = useState(ActiveEnum.Text);

  const initDefaultTitle = () => {
    setActiveEnum(context.defaultActive!);
    const arr = context.formats!.reduce((pre, it) => {
      let item = it as ActiveEnum;
      const active = context.defaultActive === item;
      if (
        Object.keys(ActiveEnum)
          .map((key) => key.toLowerCase())
          .includes(item)
      ) {
        return [
          ...pre,
          {
            title: ActiveTitle[item],
            tag: item,
            active,
          },
        ];
      }
      return pre;
    }, [] as ITitleActive[]);
    setTitleList(arr);
  };

  const handleTitleChange = (value: ITitleActive) => () => {
    if (focus) {
      setActiveEnum(value.tag);
      setTitleList((val) =>
        val.reduce((pre, item) => {
          if (item.tag === value.tag) {
            return [
              ...pre,
              {
                ...item,
                active: true,
              },
            ];
          }
          return [
            ...pre,
            {
              ...item,
              active: false,
            },
          ];
        }, [] as ITitleActive[]),
      );
      onSwitchChange && onSwitchChange();
    }
  };

  const handleArrowActive = (op: 'up' | 'down') => {
    if (context.id === currId) {
      const n = titleList.length;
      const idx = titleList.findIndex((item) => item.active);
      const pre = op === 'up' ? (idx - 1 + n) % n : (idx + 1) % n;
      const nextList = titleList.map((item, index) => {
        if (index === pre) {
          setActiveEnum(item.tag);
          return {
            ...item,
            active: true,
          };
        }
        return {
          ...item,
          active: false,
        };
      });
      setTitleList(nextList);
      onSwitchChange && onSwitchChange();
    }
  };

  useKeyPress('uparrow', () => {
    !navFocus && handleArrowActive('up');
  });

  useKeyPress('downarrow', () => {
    !navFocus && handleArrowActive('down');
  });

  useEffect(() => {
    initDefaultTitle();
  }, []);

  useEffect(() => {
    onActiveChange && onActiveChange(activeEnum);
  }, [activeEnum]);

  return (
    <div className={styles.title}>
      <div className={styles.ctx}>
        <div className={styles.text}>{titleList.filter((item) => item.active)?.[0]?.title}</div>
        <div className={styles.time}>{dayjs(context.timestamp).format('YYYY-MM-DD HH:mm')}</div>
      </div>
      <div>
        {titleList
          .filter((item) => !item.active)
          .map((item, index) => {
            return (
              <Button
                style={{ color: focus ? '#ffffffd9' : '#FFFFFFA6' }}
                disabled={!focus}
                type="text"
                key={`${item.title}-${index}`}
                onClick={handleTitleChange(item)}
              >
                {item?.title}
              </Button>
            );
          })}
      </div>
    </div>
  );
};

export default CardTitle;

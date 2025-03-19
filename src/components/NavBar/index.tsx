import { FC, KeyboardEventHandler, useRef } from 'react';
import { Input } from 'antd';
import styles from './index.module.scss';
import { InputRef, SearchProps } from 'antd/es/input';
import Tags from '@/components/Tags';
import { ITag } from '@/actions/clipboard/type';
import { useKeyPress } from 'ahooks';

const { Search } = Input;

export interface INavBarProps {
  show?: boolean;
  ctxLen?: number;
  checkFocus?: (isFocus: boolean) => void;
  onSelectedTagChange?: (selectedTag: ITag | null) => void;
  onSearchChange?: (value: string) => void;
  reloadCard?: () => Promise<void>;
}

const NavBar: FC<INavBarProps> = ({
  show,
  ctxLen,
  reloadCard,
  checkFocus,
  onSelectedTagChange,
  onSearchChange,
}) => {
  const inputRef = useRef<InputRef>(null);
  const handleFocus = () => {
    checkFocus && checkFocus(true);
  };

  const handleBlur = () => {
    checkFocus && checkFocus(false);
  };

  const handleSearch: SearchProps['onSearch'] = (value) => {
    onSearchChange && onSearchChange(value);
  };

  const handleSelected = (tag: ITag | null) => {
    onSelectedTagChange && onSelectedTagChange(tag);
  };

  const handleKeyDownSearch: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch(event.currentTarget.value, event);
      ctxLen &&
        setTimeout(() => {
          checkFocus?.(false);
        }, 400);
    }
  };

  useKeyPress(['meta.f', 'ctrl.f'], (e) => {
    checkFocus?.(true);
    e.preventDefault();
    inputRef.current!.focus({ cursor: 'end' });
  });

  return (
    <div className={styles.navBar}>
      <Search
        ref={inputRef}
        allowClear
        size="small"
        placeholder="Y-Clip"
        onChange={handleFocus}
        onClick={handleFocus}
        onBlur={handleBlur}
        onSearch={handleSearch}
        onKeyDown={handleKeyDownSearch}
        style={{ width: 280 }}
      />
      <div className={styles.tags}>
        <Tags
          onSelectedTagChange={handleSelected}
          reloadCard={reloadCard}
          show={show}
          checkFocus={checkFocus}
        />
      </div>
    </div>
  );
};
export default NavBar;

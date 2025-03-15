import { FC, KeyboardEventHandler } from 'react';
import { Input } from 'antd';
import styles from './index.module.scss';
import { SearchProps } from 'antd/es/input';
import Tags from '@/components/Tags';
import { ITag } from '@/actions/clipboard/type';
import { v4 as uuidv4 } from 'uuid';

const { Search } = Input;

export interface INavBarProps {
  checkFocus?: (isFocus: boolean) => void;
  onSelectedTagChange?: (selectedTag: ITag | null) => void;
  onSearchChange?: (value: string) => void;
}

const NavBar: FC<INavBarProps> = ({ checkFocus, onSelectedTagChange, onSearchChange }) => {
  const handleFocus = () => {
    checkFocus && checkFocus(true);
  };

  const handleBlur = () => {
    checkFocus && checkFocus(false);
  };

  const handleSearch: SearchProps['onSearch'] = (value) => {
    console.info('search-->', value);
    onSearchChange && onSearchChange(value);
  };

  const handleSelected = (tag: ITag | null) => {
    onSelectedTagChange && onSelectedTagChange(tag);
  };

  const handleKeyDownSearch: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      handleSearch(event.currentTarget.value, event);
    }
  };

  return (
    <div className={styles.navBar}>
      <Search
        allowClear
        size="small"
        placeholder="Y-Clip"
        onClick={handleFocus}
        onBlur={handleBlur}
        onSearch={handleSearch}
        onKeyDown={handleKeyDownSearch}
        style={{ width: 280 }}
      />
      <div className={styles.tags}>
        <Tags onSelectedTagChange={handleSelected} />
      </div>
    </div>
  );
};
export default NavBar;

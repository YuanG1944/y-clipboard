import { FC, KeyboardEventHandler } from 'react';
import { Input } from 'antd';
import styles from './index.module.scss';
import { SearchProps } from 'antd/es/input';

const { Search } = Input;

export interface INavBarProps {
  checkFocus?: (isFocus: boolean) => void;
}

const NavBar: FC<INavBarProps> = ({ checkFocus }) => {
  const handleFocus = () => {
    checkFocus && checkFocus(true);
  };

  const handleBlur = () => {
    checkFocus && checkFocus(false);
  };

  const handleSearch: SearchProps['onSearch'] = (value, event, info) => {
    console.info('onSearch--->', info?.source, value);
  };

  const handleKeyDownSearch: KeyboardEventHandler<HTMLInputElement> = event => {
    if (event.key === 'Enter') {
      handleSearch(event.currentTarget.value, event);
    }
    console.info('event', event);
  };

  return (
    <Search
      allowClear
      size='small'
      placeholder='Y-Clips'
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSearch={handleSearch}
      onKeyDown={handleKeyDownSearch}
      style={{ width: 280 }}
    />
  );
};
export default NavBar;

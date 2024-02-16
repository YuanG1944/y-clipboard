import { FC } from 'react';
import styles from './index.module.scss';
import { Button, Typography, Input } from 'antd';

const { Text } = Typography;

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

  return (
    <>
      <Input value={'xxxxx'} style={{ width: 200 }} onFocus={handleFocus} onBlur={handleBlur} />
    </>
  );
};
export default NavBar;

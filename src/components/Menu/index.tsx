import React from 'react';
import type { MenuProps } from 'antd';
import { Menu as AntdMenu } from 'antd';
import styles from './index.module.scss';

type MenuItem = Required<MenuProps>['items'][number];

export interface IMenuProps {
  defaultSelectedKeys?: string[];
  items?: MenuItem[];
  onSelect?: MenuProps['onSelect'];
}

export const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
};

const Menu: React.FC<IMenuProps> = ({ defaultSelectedKeys = [], items = [], onSelect }) => {
  return (
    <AntdMenu
      className={styles.menu}
      defaultSelectedKeys={defaultSelectedKeys}
      items={items}
      onSelect={(info) => onSelect && onSelect(info)}
    />
  );
};

export default Menu;

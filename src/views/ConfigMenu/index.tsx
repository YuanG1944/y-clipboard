import { FC, useMemo, useState } from 'react';
import { Flex, Layout, MenuProps } from 'antd';
import Menu, { getItem } from '@/components/Menu';
import styles from './index.module.scss';
import Hotkey from './Hotkey';
import Version from './Version';

const { Sider, Content } = Layout;

export enum MenuEnum {
  HOTKEY = 'hotkey',
  VERSION = 'version',
}

const items: MenuProps['items'] = [
  getItem('Hotkey', MenuEnum.HOTKEY, null),
  getItem('Version', MenuEnum.VERSION, null),
];

const ConfigMenu: FC = () => {
  const [menuItem, setMenuItem] = useState<MenuEnum>(MenuEnum.HOTKEY);

  const handleOnSelected = (info: { key: string }) => {
    setMenuItem(info.key as MenuEnum);
  };

  const Render = useMemo(() => {
    switch (menuItem) {
      case MenuEnum.HOTKEY:
        return Hotkey;
      case MenuEnum.VERSION:
        return Version;
      default:
        return null;
    }
  }, [menuItem]);

  return (
    <Flex gap="middle" wrap="wrap">
      <Layout className={styles.configLayout}>
        <Sider width="25%" className={styles.sider}>
          <Menu items={items} onSelect={handleOnSelected} defaultSelectedKeys={[menuItem]} />
        </Sider>
        <Layout>
          <Content className={styles.content}>{Render && <Render />}</Content>
        </Layout>
      </Layout>
    </Flex>
  );
};
export default ConfigMenu;

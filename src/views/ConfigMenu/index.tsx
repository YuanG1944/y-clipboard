import { FC, useMemo, useState } from 'react';
import { Flex, Layout, MenuProps } from 'antd';
import Menu, { getItem } from '@/components/Menu';
import styles from './index.module.scss';
import Hotkey from './Hotkey';
import Version from './Version';
import History from './History';
import yicon from '@/assets/y-icon.png';
import { DesktopOutlined, HistoryOutlined, MacCommandOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import SwitchLang from './SwitchLang';

const { Sider, Content } = Layout;

export enum MenuEnum {
  HOTKEY = 'hotkey',
  VERSION = 'version',
  HISTORY = 'history',
}

const ConfigMenu: FC = () => {
  const [menuItem, setMenuItem] = useState<MenuEnum>(MenuEnum.HOTKEY);
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    getItem(t('hotkey.title'), MenuEnum.HOTKEY, <MacCommandOutlined />),
    getItem(t('history.title'), MenuEnum.HISTORY, <HistoryOutlined />),
    getItem(t('version.title'), MenuEnum.VERSION, <DesktopOutlined />),
  ];

  const handleOnSelected = (info: { key: string }) => {
    setMenuItem(info.key as MenuEnum);
  };

  const Render = useMemo(() => {
    switch (menuItem) {
      case MenuEnum.HOTKEY:
        return Hotkey;
      case MenuEnum.HISTORY:
        return History;
      case MenuEnum.VERSION:
        return Version;
      default:
        return null;
    }
  }, [menuItem]);

  const Header = () => {
    return (
      <div className={styles.header}>
        <img src={yicon} alt="header icon" />
        <div className={styles.text}>Y-CLIP</div>
      </div>
    );
  };

  return (
    <Flex gap="middle" wrap="wrap">
      <Layout className={styles.configLayout}>
        <Sider className={styles.sider}>
          <div className={styles.top}>
            <Header />
            <Menu items={items} onSelect={handleOnSelected} defaultSelectedKeys={[menuItem]} />
          </div>
          <div className={styles.bottom}>
            <SwitchLang />
          </div>
        </Sider>
        <Layout>
          <Content className={styles.content}>{Render && <Render />}</Content>
        </Layout>
      </Layout>
    </Flex>
  );
};
export default ConfigMenu;

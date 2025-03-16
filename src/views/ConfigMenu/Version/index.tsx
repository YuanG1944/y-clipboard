import { FC, useEffect, useState } from 'react';
import styles from './index.module.scss';
import { Button, Result, Switch } from 'antd';
import YIcon from '@/assets/y-icon.png';
import { Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const Version: FC = () => {
  const [autostart, setAutostart] = useState(true);
  const { t } = useTranslation();

  const initAutostartStatus = async () => {
    const flag = await isEnabled();
    setAutostart(flag);
  };

  const handleAutostart = (val: boolean) => {
    setAutostart(val);

    if (val) {
      return enable();
    }
    return disable();
  };

  useEffect(() => {
    initAutostartStatus();
  });

  const handleClick = () => {
    const a = window.document.createElement('a');
    a.style.display = 'none';
    a.href = 'https://github.com/YuanG1944/y-clipboard';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className={styles.version}>
      <Result
        icon={<img width={160} src={YIcon}></img>}
        title={<Title>Y-CLIP</Title>}
        subTitle={
          <div className={styles.subtitle}>
            <div>{t('version.description')}</div>
            <div className={styles.autostart}>
              <div className={styles.text}>{t('version.Autostart')}</div>
              <Switch
                value={autostart}
                onChange={handleAutostart}
                size="small"
                // checkedChildren={<CheckOutlined />}
                // unCheckedChildren={<CloseOutlined />}
                defaultChecked
              />
            </div>
          </div>
        }
        extra={
          <>
            <div className={styles.extra}>
              <div>{t('version.Version')}: 0.1.8</div>
              <Button
                className={styles.btn}
                icon={<GithubOutlined />}
                shape="circle"
                size="small"
                onClick={handleClick}
              ></Button>
            </div>
          </>
        }
      />
    </div>
  );
};
export default Version;

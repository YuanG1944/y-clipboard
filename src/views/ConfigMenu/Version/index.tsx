import { FC } from 'react';
import styles from './index.module.scss';
import { Button, Result } from 'antd';
import YIcon from '@/assets/y-icon.png';
import { Typography } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Version: FC = () => {
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
            <div>A cross-platform tiny clipboard management tool power by tauri</div>
          </div>
        }
        extra={
          <div className={styles.extra}>
            <div>Version: 0.1.8</div>
            <Button
              className={styles.btn}
              icon={<GithubOutlined />}
              shape="circle"
              size="small"
              onClick={handleClick}
            ></Button>
          </div>
        }
      />
    </div>
  );
};
export default Version;

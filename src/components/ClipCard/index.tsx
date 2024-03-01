import { FC, useEffect, useMemo, useState } from 'react';
import { Card, Upload, UploadFile } from 'antd';
import styles from './index.module.scss';
import { ActiveEnum, StorageItem } from '@/actions/clipboard/type';
import classnames from 'classnames';
import CardTitle from './CardTitle';
import QueueAnim from 'rc-queue-anim';
import { openFile } from '@/actions/clipboard';
import { os } from '@tauri-apps/api';

export interface ICardProps {
  id: string;
  currId: string;
  context: StorageItem;
  navFocus: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onActiveChange?: (act: ActiveEnum) => void;
}

const ClipCard: FC<ICardProps> = ({
  context,
  currId,
  navFocus,
  id,
  onClick,
  onDoubleClick,
  onActiveChange,
}) => {
  const [active, setActive] = useState(ActiveEnum.Text);
  const [show, setShow] = useState(true);
  const [platform, setPlatform] = useState('');

  const focus = useMemo(() => currId === context.id, [currId]);

  const getPlatform = () => {
    os.platform().then((p) => {
      setPlatform(p);
    });
  };

  const renderUrl = () => {
    const urlRegex = /img src="([^"]+)"/;
    const urls = context?.html?.match(urlRegex);
    return urls?.length === 2 ? (
      <a href={urls[1]} target="_blank">
        {urls[1]}
      </a>
    ) : (
      <div style={{ wordBreak: 'break-word', width: '100%' }}>
        <div dangerouslySetInnerHTML={{ __html: context.html || '' }}></div>
      </div>
    );
  };

  const handleOpenFile = (file: UploadFile) => {
    file.thumbUrl && openFile(file.thumbUrl);
  };

  const highlightStyles = useMemo(() => {
    return focus ? styles.highlight : '';
  }, [currId]);

  const cardClass = useMemo(() => `card-background-${String(active ?? '')}`, [active]);

  const contents = useMemo(() => {
    switch (active) {
      case ActiveEnum.Text:
        return <div className={styles.text}>{context.text}</div>;
      case ActiveEnum.Html:
        return renderUrl();
      case ActiveEnum.Image:
        return <img width="100%" src={`data:image/png;base64,${context.image}`} alt="" />;
      case ActiveEnum.File:
        const fileList = context?.files?.map((file) => ({
          uid: file,
          name: platform === 'win32' ? file.split('\\').slice(-1)[0] : file.split('/').slice(-1)[0],
          thumbUrl: file,
        }));
        return (
          <Upload
            showUploadList={{ showRemoveIcon: false }}
            fileList={fileList}
            onPreview={handleOpenFile}
          />
        );
      default:
        return <></>;
    }
  }, [active, platform]);

  const handleActiveChange = (act: ActiveEnum) => {
    setActive(act);
    onActiveChange && onActiveChange(act);
  };

  const handleSwitchChange = () => {
    handleOnSwitch();
  };

  const handleOnSwitch = () => {
    setShow(false);
    setTimeout(() => {
      setShow(true);
    }, 300);
  };

  useEffect(() => {
    getPlatform();
  }, []);

  return (
    <Card
      id={id}
      title={
        <CardTitle
          id={id}
          context={context}
          currId={currId}
          focus={focus}
          navFocus={navFocus}
          onActiveChange={handleActiveChange}
          onSwitchChange={handleSwitchChange}
        />
      }
      className={classnames(styles.clipCard, highlightStyles, cardClass)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      hoverable={!focus}
    >
      <QueueAnim type={'left'} ease={'easeInOutQuart'} key="ani">
        {show ? (
          <div className={styles.clipCardCtx} key={'num2'}>
            {contents}
          </div>
        ) : null}
      </QueueAnim>
    </Card>
  );
};
export default ClipCard;

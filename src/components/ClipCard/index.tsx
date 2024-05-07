import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Divider, Popover, Upload, UploadFile } from 'antd';
import styles from './index.module.scss';
import { ActiveEnum, ITag, StorageItem } from '@/actions/clipboard/type';
import classnames from 'classnames';
import CardTitle from './CardTitle';
import QueueAnim from 'rc-queue-anim';
import { cancelTag, openFile, subscribeTag } from '@/actions/clipboard';
import { os } from '@tauri-apps/api';
import { HeartTwoTone } from '@ant-design/icons';

export interface ICardProps {
  id: string;
  currId: string;
  context: StorageItem;
  navFocus: boolean;
  tags?: ITag[];
  queryText?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onActiveChange?: (act: ActiveEnum, id: string) => void;
  reloadTags?: () => Promise<ITag[]>;
  onExit?: () => void;
}

const ClipCard: FC<ICardProps> = ({
  context,
  currId,
  navFocus,
  id,
  onClick,
  onDoubleClick,
  onActiveChange,
  reloadTags,
  tags,
  queryText,
  onExit,
}) => {
  const [active, setActive] = useState(ActiveEnum.Text);
  const [show, setShow] = useState(true);
  const [platform, setPlatform] = useState('');
  const [hearts, setHearts] = useState<string[]>([]);
  const [openTooltip, setTooltip] = useState(false);
  const bRef = useRef<HTMLDivElement>(null);

  const focus = useMemo(() => currId === context.id, [currId]);

  const hide = () => {
    setTooltip(false);
  };

  const getPlatform = () => {
    os.platform().then((p) => {
      setPlatform(p);
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    reloadTags && reloadTags().finally(() => setTooltip(newOpen));
  };

  const renderUrl = () => {
    const urlRegex = /\<img src="([^"]+)"/;
    const urls = context?.html?.match(urlRegex);
    return (
      <div className={styles.text} style={{ wordBreak: 'break-word' }}>
        {urls?.length === 2 ? (
          <a href={urls[1]} target="_blank">
            {urls[1]}
          </a>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: context.html || '' }}></div>
        )}
      </div>
    );
  };

  const renderText = () => {
    if (queryText && context.text) {
      const text = context.text;
      const index = text.indexOf(queryText);
      const beforeFocus = index !== -1 ? text.slice(0, index) : '';
      const afterFocus = index !== -1 ? text.slice(index + queryText.length) : '';

      bRef.current &&
        bRef.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      return (
        <div className={styles.text}>
          {beforeFocus}
          <b
            ref={bRef}
            style={{ display: 'inline-block', backgroundColor: '#faad14', color: '#fff' }}
          >
            {queryText}
          </b>
          {afterFocus}
        </div>
      );
    }

    return <div className={styles.text}>{context.text}</div>;
  };

  const renderRTF = () => {
    if (context.html) {
      return (
        <div className={styles.text}>
          <div dangerouslySetInnerHTML={{ __html: context.html || '' }}></div>
        </div>
      );
    }
    return <div className={styles.text}>{context.text}</div>;
  };

  const handleOpenFile = (file: UploadFile) => {
    file.thumbUrl && openFile(file.thumbUrl).finally(() => onExit && onExit());
  };

  const highlightStyles = useMemo(() => {
    return focus ? styles.highlight : '';
  }, [currId]);

  const cardClass = useMemo(() => `card-background-${String(active ?? '')}`, [active]);

  const contents = useMemo(() => {
    switch (active) {
      case ActiveEnum.Text:
        return renderText();
      case ActiveEnum.Html:
        return renderUrl();
      case ActiveEnum.RTF:
        return renderRTF();
      case ActiveEnum.Image:
        return (
          <div className={styles.cover}>
            <img width="100%" src={`data:image/png;base64,${context.image}`} alt="" />
          </div>
        );
      case ActiveEnum.Files:
        const fileList = context?.files?.map((file) => ({
          uid: file,
          name: platform === 'win32' ? file.split('\\').slice(-1)[0] : file.split('/').slice(-1)[0],
          thumbUrl: file,
        }));
        return (
          <div className={styles.text}>
            <Upload
              showUploadList={{ showRemoveIcon: false }}
              fileList={fileList}
              onPreview={handleOpenFile}
            />
          </div>
        );
      default:
        return <></>;
    }
  }, [active, platform, queryText]);

  const handleActiveChange = (act: ActiveEnum) => {
    // setTimeout(() => {
    setActive(act);
    // });
    onActiveChange && onActiveChange(act, context.id!);
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

  const handleFavorite = async (historyId: string, tagId: string) => {
    if (historyId && hearts.includes(tagId)) {
      return cancelTag(historyId, tagId).finally(() => {
        setHearts((val) => val.filter((t) => t !== tagId));
        hide();
      });
    }

    return subscribeTag(historyId, tagId).finally(() => {
      setHearts((val) => [...val, tagId]);
      hide();
    });
  };

  const initSelectedTags = () => {
    setHearts(context?.tags?.map((t) => t.id) ?? []);
  };

  useEffect(() => {
    initSelectedTags();
    getPlatform();
  }, []);

  const PopoverContext = useMemo(() => {
    return (
      <div className={styles.popoverContext}>
        {tags?.map((tag, index) => (
          <div key={`${tag.id}${index}`}>
            <Button
              type="link"
              style={{
                margin: 0,
                padding: '0 20px',
                color: hearts.includes(tag.id) ? '#1677ff' : '#000000e0',
              }}
              onClick={() => handleFavorite(context.id ?? '', tag.id)}
            >
              {tag.name}
            </Button>
            {index < tags?.length - 1 && <Divider style={{ margin: '0px' }} />}
          </div>
        ))}
      </div>
    );
  }, [tags, hearts]);

  const heartColor = useMemo(() => {
    return hearts.length ? '#ff4d4f' : '#bfbfbf';
  }, [hearts]);

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
      actions={[
        null,
        null,
        <Popover
          style={{ padding: 0 }}
          content={PopoverContext}
          trigger="click"
          placement="leftTop"
          arrow={false}
          open={openTooltip}
          onOpenChange={handleOpenChange}
        >
          <Button shape="circle" disabled={!focus} type="text">
            <HeartTwoTone twoToneColor={heartColor} key="ellipsis" />
          </Button>
        </Popover>,
      ]}
    >
      <QueueAnim type={'left'} ease={'easeInOutQuart'} key="ani">
        {show ? (
          <div className={styles.clipCardCtx} key={'contents'}>
            {contents}
          </div>
        ) : null}
      </QueueAnim>
    </Card>
  );
};
export default ClipCard;

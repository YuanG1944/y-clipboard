import { FC, useMemo, useState } from 'react';
import { Button, Card } from 'antd';
import styles from './index.module.scss';
import { ActiveEnum, StorageItem } from '@/actions/clipboard/type';
import classnames from 'classnames';
import CardTitle from './CardTitle';

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

  const focus = useMemo(() => currId === context.id, [currId]);

  const renderUrl = () => {
    const urlRegex = /img src="([^"]+)"/;
    const urls = context.html.match(urlRegex);
    return urls?.length === 2 ? (
      <a href={urls[1]}>{urls[1]}</a>
    ) : (
      <div
        style={{ wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: context.html }}
      ></div>
    );
  };

  const highlightStyles = useMemo(() => {
    return focus ? styles.highlight : '';
  }, [currId]);

  const contents = useMemo(() => {
    switch (active) {
      case ActiveEnum.Text:
        return <div>{context.text}</div>;
      case ActiveEnum.Html:
        return renderUrl();
      case ActiveEnum.Image:
        return <img width='100%' src={context.image} alt='' />;
      case ActiveEnum.File:
        return <div>File</div>;
      default:
        return <></>;
    }
  }, [active]);

  const handleActiveChange = (act: ActiveEnum) => {
    setActive(act);
    onActiveChange(act);
  };

  return (
    <Card
      id={id}
      title={
        <CardTitle
          id={id}
          context={context}
          currId={currId}
          onActiveChange={handleActiveChange}
          focus={focus}
          navFocus={navFocus}
        />
      }
      className={classnames(styles.clipCard, highlightStyles)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      hoverable={!focus}
    >
      <div className={styles.clipCardCtx}>{contents}</div>
    </Card>
  );
};
export default ClipCard;

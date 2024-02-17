import { FC, useMemo } from 'react';
import { Card } from 'antd';
import styles from './index.module.scss';
import { StorageItem } from '@/actions/clipboard/type';
import classnames from 'classnames';

export interface ICardProps {
  id: string;
  currId: string;
  context: StorageItem;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
}

const ClipCard: FC<ICardProps> = ({ context, currId, id, onClick, onDoubleClick }) => {
  const highlightStyles = useMemo(() => {
    return currId === context.id ? styles.highlight : '';
  }, [currId]);

  const Contents = () => {
    if (context.html) {
      return <div dangerouslySetInnerHTML={{ __html: context.html }}></div>;
    }
    return context.text;
  };

  return (
    <Card
      id={id}
      title={context.formats?.[0]}
      className={classnames(styles.clipCard, highlightStyles)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={styles.clipCardCtx}>
        <Contents />
      </div>
    </Card>
  );
};
export default ClipCard;

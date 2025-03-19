import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Input, Tag, Tooltip } from 'antd';
import { addTag, deleteTag, getTagsAll, setTag } from '@/actions/clipboard';
import { ITag } from '@/actions/clipboard/type';
import { useKeyPress } from 'ahooks';

const tagColors: string[] = [
  '#ff4d4f',
  '#2db7f5',
  '#f50',
  '#87d068',
  '#108ee9',
  '#722ed1',
  '#eb2f96',
];

const tagInputStyle: React.CSSProperties = {
  width: 64,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: 'top',
};

export interface TagCollectType {
  show?: boolean;
  reloadCard?: () => Promise<void>;
  onSelectedTagChange?: (selectedTag: ITag | null) => void;
  checkFocus?: (isFocus: boolean) => void;
}

const Tags: React.FC<TagCollectType> = ({ show, onSelectedTagChange, reloadCard, checkFocus }) => {
  const [tags, setTags] = useState<ITag[]>([]);
  const [selectedTag, setSelectedTag] = useState<ITag | null>(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const [_, setTagIdx] = useState(0);
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  const handleClose = (removedTag: ITag) => {
    setSelectedTag(null);
    reloadCard?.();
    deleteTag(removedTag.id).finally(() => reloadTags());
  };

  const showInput = () => {
    setInputVisible(true);
    checkFocus?.(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const tagColor = (index: number) => {
    const len = tagColors.length;
    return tagColors[index % len];
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.map((t) => t.name).includes(inputValue)) {
      addTag(inputValue).finally(() => reloadTags());
    }
    setInputVisible(false);
    setTimeout(() => {
      checkFocus?.(false);
    }, 500);
    setInputValue('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    const editTag = tags[editInputIndex];
    setTag(editTag.id, editInputValue).finally(() => reloadTags());
    setEditInputIndex(-1);
    setEditInputValue('');
  };

  const tagPlusStyle: React.CSSProperties = {
    cursor: 'pointer',
    height: 22,
    borderStyle: 'dashed',
  };

  const reloadTags = () => {
    getTagsAll().then((t) => {
      setTags(t);
    });
  };

  const handleSelected = (tag: ITag) => {
    if (tag.id && selectedTag?.id && tag.id === selectedTag.id) {
      return setSelectedTag(null);
    }
    return setSelectedTag(tag);
  };

  useKeyPress('tab', (evt) => {
    evt.preventDefault();
    const len = tags.length + 1;
    setTagIdx((idx) => {
      setSelectedTag(tags[idx % len]);
      return idx + 1;
    });
  });

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputValue]);

  useEffect(() => {
    onSelectedTagChange && onSelectedTagChange(selectedTag);
  }, [selectedTag]);

  useEffect(() => {
    if (!show) {
      setTagIdx(0);
    }
  }, [show]);

  useEffect(() => {
    reloadTags();
  }, []);

  return (
    <div>
      {tags.map<React.ReactNode>((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag.id}
              size="small"
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }
        const isLongTag = tag.name.length > 20;
        const tagElem = (
          <Tag
            color={tagColor(index)}
            key={tag.id}
            closable={index !== 0}
            style={{
              userSelect: 'none',
              cursor: 'pointer',
              opacity: selectedTag?.id === tag.id ? '1' : '0.5',
            }}
            onClose={() => handleClose(tag)}
            onClick={() => handleSelected(tag)}
          >
            <span
              onDoubleClick={(e) => {
                if (index !== 0) {
                  setEditInputIndex(index);
                  setEditInputValue(tag.name);
                  e.preventDefault();
                }
              }}
            >
              {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
            </span>
          </Tag>
        );
        return isLongTag ? (
          <Tooltip title={tag.name} key={tag.id}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}></Tag>
      )}
    </div>
  );
};

export default Tags;

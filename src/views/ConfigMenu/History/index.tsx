import { FC, useEffect, useState } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';

import styles from './index.module.scss';
import {
  Breadcrumb,
  Button,
  Descriptions,
  DescriptionsProps,
  Form,
  Modal,
  Select,
  Typography,
} from 'antd';
import {
  clearHistory,
  getExpire,
  ExpireKey,
  setExpire,
  restartClearInterval,
} from '@/actions/datamanage';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const History: FC = () => {
  const [form] = Form.useForm();
  const expireValue = Form.useWatch(ExpireKey, form);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();

  const expireOptions = [
    {
      label: t('history.ExpireSelect.1'),
      value: '-1 day',
    },
    {
      label: t('history.ExpireSelect.7'),
      value: '-7 day',
    },
    {
      label: t('history.ExpireSelect.14'),
      value: '-14 day',
    },
    {
      label: t('history.ExpireSelect.30'),
      value: '-30 day',
    },
    {
      label: t('history.ExpireSelect.60'),
      value: '-60 day',
    },
  ];

  const handleClearHistory = async () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    clearHistory();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const initFormValue = async () => {
    const expVal = await getExpire();
    form.setFieldValue(ExpireKey, expVal);
  };

  const changeExpireTime = (val: string) => {
    setExpire(val);
  };

  useEffect(() => {
    initFormValue();
  }, []);

  useEffect(() => {
    restartClearInterval();
  }, [expireValue]);

  const items: DescriptionsProps['items'] = [
    {
      label: <Text>{t('history.Expire Time')}: </Text>,
      span: 'filled',
      children: (
        <Form.Item
          // label={t('history.Expire Time')}
          name={ExpireKey}
        >
          <Select
            style={{ width: 220 }}
            placeholder="Please Select history expire time"
            onChange={changeExpireTime}
          >
            {expireOptions.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      ),
    },
  ];

  return (
    <div className={styles.hotkey}>
      <div className={styles.header}>
        <Breadcrumb separator=">" items={[{ title: 'Y-CLIP' }, { title: t('history.title') }]} />
        <Title className={styles.title}>{t('history.title')}</Title>
      </div>

      <div className={styles.form}>
        <Form layout="vertical" form={form}>
          <Descriptions bordered items={items} layout="vertical" />
        </Form>

        <Button
          className={styles.btn}
          style={{ width: '100%' }}
          type="primary"
          onClick={handleClearHistory}
        >
          {t('history.Clear History')}
        </Button>
      </div>

      <Modal
        centered
        title={<div className={styles.deleteModalIcon}></div>}
        open={isModalOpen}
        onOk={handleOk}
        okText={t('history.alert.delete')}
        cancelText={t('history.alert.cancel')}
        okButtonProps={{}}
        onCancel={handleCancel}
      >
        <p className={styles.modalContents}>{t('history.alert.description')}</p>
      </Modal>
    </div>
  );
};

export default History;

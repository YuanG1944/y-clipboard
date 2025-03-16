import { FC, useEffect, useState } from 'react';
import { ExclamationCircleFilled } from '@ant-design/icons';

import styles from './index.module.scss';
import { Button, Form, Modal, Select } from 'antd';
import {
  clearHistory,
  getExpire,
  ExpireKey,
  setExpire,
  restartClearInterval,
} from '@/actions/datamanage';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className={styles.hotkey}>
      <Form className={styles.form} layout="vertical" form={form}>
        <Form.Item label={t('history.Expire Time')} name={ExpireKey}>
          <Select placeholder="Please Select history expire time" onChange={changeExpireTime}>
            {expireOptions.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className={styles.clearButton}>
          <Button type="primary" onClick={handleClearHistory} danger>
            {t('history.Clear History')}
          </Button>
        </Form.Item>
      </Form>

      <Modal
        centered
        title={
          <div className={styles.deleteModalIcon}>
            <ExclamationCircleFilled />
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        okText={t('history.alert.delete')}
        cancelText={t('history.alert.cancel')}
        okButtonProps={{
          danger: true,
        }}
        onCancel={handleCancel}
      >
        <p className={styles.modalContents}>{t('history.alert.description')}</p>
      </Modal>
    </div>
  );
};

export default History;

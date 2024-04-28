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

const { Option } = Select;

const expireOptions = [
  // {
  //   label: '10 Seconds',
  //   value: '-10 seconds',
  // },
  {
    label: '1 Day',
    value: '-1 day',
  },
  {
    label: '7 Days',
    value: '-7 day',
  },
  {
    label: '14 Days',
    value: '-14 day',
  },
  {
    label: '30 Days',
    value: '-30 day',
  },
  {
    label: '60 Days',
    value: '-60 day',
  },
];

const History: FC = () => {
  const [form] = Form.useForm();
  const expireValue = Form.useWatch(ExpireKey, form);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <Form.Item label="Expire Time" name={ExpireKey}>
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
            Clear History
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
        okText="Delete"
        okButtonProps={{
          danger: true,
        }}
        onCancel={handleCancel}
      >
        <p className={styles.modalContents}>Do you want to delete all your paste history?</p>
      </Modal>
    </div>
  );
};

export default History;

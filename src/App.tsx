import Layout from '@/views/Layout';
import './global.scss';
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token，影响范围大
          colorPrimary: '#faad14',
          borderRadius: 2,

          // 派生变量，影响范围小
          colorBgContainer: '#fffbe6',
        },
      }}
    >
      <Layout />
    </ConfigProvider>
  );
};

export default App;

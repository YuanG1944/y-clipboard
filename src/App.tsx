import Layout from '@/views/Layout';
import './global.scss';
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#faad14',
          borderRadius: 2,
        },
      }}
    >
      <Layout />
    </ConfigProvider>
  );
};

export default App;
import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;

function Mobile() {
  return (
    <Layout>
      <Header>
        <Typography.Title level={2} style={{ color: 'white', marginBottom: 0, marginTop: '8px' }}>
          Game Datacards
        </Typography.Title>
      </Header>
      <Content style={{ height: 'calc(100vh - 64px)', textAlign: 'center' }}>
        <Typography.Title level={4} style={{ marginBottom: 0, marginTop: '8px' }}>
          Mobile is not yet supported... <br />Coming soon(ish)&trade;
        </Typography.Title>
      </Content>
    </Layout>
  );
}

export default Mobile;

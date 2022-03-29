import { Layout, Typography } from 'antd';
import { UnitCard } from './Components/UnitCard';

const { Header, Content } = Layout;

function Mobile() {
  return (
    <Layout>
      <Header>
        <Typography.Title level={2} style={{ color: 'white', marginBottom: 0, marginTop: '8px' }}>
          Game Datacards
        </Typography.Title>
      </Header>
      <Content style={{ height: 'calc(100vh - 64px)' }}>
        <Typography.Title level={4} style={{ marginBottom: 0, marginTop: '8px', textAlign: 'center' }}>
          Mobile is not yet supported... <br />
          Coming soon(ish)&trade;
        </Typography.Title>
        <UnitCard
          unit={{
            name: 'Example card',
            role: 'HQ',
            datasheet: [
              {
                active: true,
                M: '6"',
                WS: '3+',
                BS: '3+',
                S: '3',
                T: '6',
                W: '3',
                A: '3',
                Ld: '7',
                Sv: '2+',
                Inv: '5++',
              },
            ],
            unit_composition: 'This is an example Datacard. You can customize it to your needs!',
            wargear: [ {
              name: 'Example wargear',
              active: true,
              profiles: [{
                name: 'Example profile',
                Range: '13"',
                type: 'Type',
                S: '5',
                AP: '5',
                D: 'D6',
              }],
            }],
            abilities: [{
              name: 'Example ability',
              showAbility: true,
              showDescription: true,
              description: 'This is an example ability. Add anything you like as an text to your cards.',
            }],
            keywords: [
              { keyword: 'Datacard', active: true },
              { keyword: 'External sources', active: true },
              { keyword: 'Awesome!', active: true },
            ],
          }}
        />
      </Content>
    </Layout>
  );
}

export default Mobile;

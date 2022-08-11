import { Image, Layout, Space, Typography } from "antd";
import { UnitCard } from "./Components/Warhammer40k/UnitCard";
import logo from "./Images/logo.png";

const { Header, Content } = Layout;

function Mobile() {
  return (
    <Layout>
      <Header>
        <Space size={"large"}>
          <Image preview={false} src={logo} width={50} />
          <Typography.Title level={3} style={{ color: "white", marginBottom: 0, marginTop: "0px" }}>
            Game Datacards
          </Typography.Title>
        </Space>
      </Header>
      <Content style={{ height: "calc(100vh - 64px)" }} className="data-40k">
        <Typography.Title
          level={4}
          style={{
            marginBottom: 0,
            marginTop: "8px",
            textAlign: "center",
            padding: "6px",
          }}>
          Mobile is only supported for viewing cards. Share a desktop card category and open it on your device.
        </Typography.Title>
        <UnitCard
          unit={{
            name: "Example card",
            role: "HQ",
            datasheet: [
              {
                active: true,
                M: '6"',
                WS: "3+",
                BS: "3+",
                S: "3",
                T: "6",
                W: "3",
                A: "3",
                Ld: "7",
                Sv: "2+",
                Inv: "5++",
              },
            ],
            unit_composition: "This is an example Datacard. You can customize it to your needs!",
            wargear: [
              {
                name: "Example wargear",
                active: true,
                profiles: [
                  {
                    name: "Example profile",
                    Range: '13"',
                    type: "Type",
                    S: "5",
                    AP: "5",
                    D: "D6",
                  },
                ],
              },
            ],
            abilities: [
              {
                name: "Example ability",
                showAbility: true,
                showDescription: true,
                description: "This is an example ability. Add anything you like as an text to your cards.",
              },
            ],
            keywords: [
              { keyword: "Datacard", active: true },
              { keyword: "External sources", active: true },
              { keyword: "Awesome!", active: true },
            ],
          }}
        />
      </Content>
    </Layout>
  );
}

export default Mobile;

import { Col, Row } from "antd";

export const MobileWelcome = () => {
  return (
    <Col>
      <p style={{ padding: "32px", fontSize: "1.3rem", fontWeight: "600", textAlign: "center" }}>
        Welcome to game-datacards.eu
      </p>
      <p style={{ padding: "32px", fontSize: "1.2rem", textAlign: "justify" }}>
        When using a mobile device you can only view data-cards. If you wish to create your own you can visit this
        website on a desktop pc.
      </p>
      <p style={{ padding: "32px", fontSize: "1.2rem", textAlign: "justify" }}>
        To get started select a card from the menu at the top right.
      </p>
      <Row style={{ padding: "16px", textAlign: "center", width: "100%" }} justify={"center"}>
        <Col span={24}>
          Join our Discord!
          <br />
          <a href="https://discord.gg/anfn4qTYC4" target={"_blank"} rel="noreferrer">
            <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"></img>
          </a>
        </Col>
      </Row>
    </Col>
  );
};

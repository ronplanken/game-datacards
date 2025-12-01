import { GitFork, Heart, Redo2, Undo2 } from "lucide-react";
import { Badge, Button, Carousel, Col, Grid, Image, Layout, Row, Space, Typography } from "antd";
import { Tooltip } from "../Components/Tooltip/Tooltip";
import { Content, Header } from "antd/lib/layout/layout";
import clone from "just-clone";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../App.css";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useFirebase } from "../Hooks/useFirebase";
import logo from "../Images/logo.png";

const { useBreakpoint } = Grid;

export const Shared = () => {
  const { Id } = useParams();
  const navigate = useNavigate();

  const { getCategory, likeCategory, logScreenView } = useFirebase();

  const [historyStorage, setHistoryStorage] = useState({ liked: [] });

  const [sharedStorage, setSharedStorage] = useState();

  const { importCategory } = useCardStorage();

  const screens = useBreakpoint();

  useEffect(() => {
    const localShareStorage = localStorage.getItem("historyStorage");
    if (localShareStorage) {
      setHistoryStorage(JSON.parse(localShareStorage));
    }
  }, []);

  useEffect(() => {
    document.title = `Shared ${sharedStorage?.category?.name || ""} - Game Datacards`;
  }, [sharedStorage]);

  useEffect(() => {
    localStorage.setItem("historyStorage", JSON.stringify(historyStorage));
  }, [historyStorage]);

  useEffect(() => {
    if (Id) {
      getCategory(Id).then((cat) => {
        setSharedStorage(cat);
      });
    }
  }, [Id, getCategory]);

  return (
    <Layout>
      <Header style={{ paddingLeft: 8 }}>
        <Row style={{ justifyContent: "space-between" }} gutter={0}>
          {screens.sm && (
            <Col>
              <Space size={"large"}>
                <Image preview={false} src={logo} width={50} />
                <Typography.Title level={3} style={{ color: "white", marginBottom: 0, marginTop: "0px" }}>
                  Game Datacards
                </Typography.Title>
              </Space>
            </Col>
          )}
          {screens.xs && (
            <Col>
              <Space size={"large"}>
                <Image preview={false} src={logo} width={50} />
                <Typography.Title level={3} style={{ color: "white", marginBottom: 0, marginTop: "0px" }}>
                  Game Datacards
                </Typography.Title>
              </Space>
            </Col>
          )}
          {screens.lg && (
            <Col>
              <Typography.Title level={3} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
                {sharedStorage?.category?.name}
              </Typography.Title>
            </Col>
          )}
          <Col>
            <Space>
              {historyStorage.liked.includes(Id) ? (
                <Badge count={sharedStorage?.likes} offset={[-4, 14]} size="small" color={"blue"} overflowCount={999}>
                  <Tooltip content="You have already liked this set.">
                    <Button
                      className="button-bar"
                      type="text"
                      size="large"
                      disabled={true}
                      icon={<Heart size={14} fill="#40a9ff" color="#40a9ff" style={{ cursor: "cursor" }} />}
                    />
                  </Tooltip>
                </Badge>
              ) : (
                <Badge count={sharedStorage?.likes} offset={[-4, 14]} size="small" color={"blue"} overflowCount={999}>
                  <Button
                    className="button-bar"
                    type="ghost"
                    size="large"
                    icon={<Heart size={14} />}
                    onClick={() => {
                      const newStorage = clone(historyStorage);
                      newStorage.liked.push(Id);
                      setHistoryStorage(newStorage);
                      setSharedStorage((prev) => {
                        return { ...prev, likes: prev.likes + 1 };
                      });
                      likeCategory(Id);
                    }}
                  />
                </Badge>
              )}
              {screens.lg && (
                <Button
                  className="button-bar"
                  type="ghost"
                  size="large"
                  icon={<GitFork size={14} />}
                  onClick={() => {
                    logScreenView("Clone cards");
                    const cloneCategory = {
                      ...sharedStorage.category,
                      name: `Imported ${sharedStorage.category.name}`,
                      uuid: uuidv4(),
                      cards: sharedStorage.category.cards.map((card) => {
                        return { ...card, uuid: uuidv4() };
                      }),
                    };

                    importCategory(cloneCategory);
                    navigate("/");
                  }}>
                  Clone
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Header>
      <Content style={{ minHeight: "calc(100vh - 64px)" }}>
        {!screens.xs && (
          <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
            {sharedStorage?.category?.cards?.map((card, index) => {
              return (
                <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                  <Row>
                    <Col key={`${card.name}-${index}`} className={`data-${card?.source ? card?.source : "40k"}`}>
                      {card?.source === "40k" && <Warhammer40KCardDisplay card={card} type="print" />}
                      {card?.source === "40k-10e" && (
                        <Warhammer40K10eCardDisplay card={card} type="print" side={card.print_side} />
                      )}
                      {card?.source === "basic" && <Warhammer40KCardDisplay card={card} type="print" />}
                      {card?.source === "necromunda" && <NecromundaCardDisplay card={card} type="print" />}
                      {!card?.source && <Warhammer40KCardDisplay card={card} type="print" />}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ display: "flex", justifyContent: "center" }}>
                    <Col>
                      {card?.source === "40k-10e" && (
                        <>
                          {card?.variant !== "full" && card?.cardType === "DataCard" && (
                            <Button
                              type={"primary"}
                              onClick={() => {
                                if (card.print_side === "back") {
                                  setSharedStorage((prev) => {
                                    const oldCards = clone(prev.category.cards);
                                    oldCards[index].print_side = "front";
                                    return { ...prev, category: { ...prev.category, cards: oldCards } };
                                  });
                                } else {
                                  setSharedStorage((prev) => {
                                    const oldCards = clone(prev.category.cards);
                                    oldCards[index].print_side = "back";
                                    return { ...prev, category: { ...prev.category, cards: oldCards } };
                                  });
                                }
                              }}>
                              {card.print_side === "back" ? "Show front" : "Show back"}
                            </Button>
                          )}
                        </>
                      )}
                    </Col>
                  </Row>
                </Col>
              );
            })}
          </Row>
        )}
        {screens.xs && (
          <Carousel dots={{ className: "dots" }}>
            {sharedStorage?.category?.cards?.map((card, index) => {
              return (
                <div key={`${card.name}-${index}`}>
                  <Row style={{ display: "flex", justifyContent: "center", backgroundColor: "#001529" }}>
                    <Col>
                      <Space align="center" style={{ width: "100%", justifyContent: "center" }}>
                        {card?.source === "40k-10e" && card.variant !== "full" && (
                          <>
                            <Button
                              icon={card.print_side === "front" ? <Redo2 size={14} /> : <Undo2 size={14} />}
                              type="ghost"
                              size="large"
                              shape="round"
                              className="button-bar"
                              onClick={() => {
                                if (card.print_side === "back") {
                                  setSharedStorage((prev) => {
                                    const oldCards = clone(prev.category.cards);
                                    oldCards[index].print_side = "front";
                                    return { ...prev, category: { ...prev.category, cards: oldCards } };
                                  });
                                } else {
                                  setSharedStorage((prev) => {
                                    const oldCards = clone(prev.category.cards);
                                    oldCards[index].print_side = "back";
                                    return { ...prev, category: { ...prev.category, cards: oldCards } };
                                  });
                                }
                              }}></Button>
                          </>
                        )}
                      </Space>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <div className={`data-${card?.source ? card?.source : "40k"}`}>
                        {card?.source === "40k" && <Warhammer40KCardDisplay card={card} type="print" />}
                        {card?.source === "40k-10e" && (
                          <Warhammer40K10eCardDisplay card={card} type="viewer" side={card.print_side} />
                        )}
                        {card?.source === "basic" && <Warhammer40KCardDisplay card={card} type="print" />}
                        {card?.source === "necromunda" && <NecromundaCardDisplay card={card} type="print" />}
                        {!card?.source && <Warhammer40KCardDisplay card={card} type="print" />}
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Carousel>
        )}
      </Content>
    </Layout>
  );
};

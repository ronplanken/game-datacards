import { useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { UnitCard } from '../Components/UnitCard';

import '../App.css';
import { Content, Header } from 'antd/lib/layout/layout';
import { Button, Col, Layout, Row, Space, Typography } from 'antd';

import { ForkOutlined, QuestionCircleOutlined, HeartOutlined, HeartTwoTone, ShareAltOutlined } from '@ant-design/icons';
import { CodeJson } from '../Icons/CodeJson';

const isMobile = window.matchMedia('only screen and (max-width: 760px)').matches;

const firebaseConfig = {
  apiKey: 'AIzaSyBRdhA0nJqt2XZwaBWEoRrHxN77sOH2rkY',
  authDomain: 'game-datacards.firebaseapp.com',
  projectId: 'game-datacards',
  storageBucket: 'game-datacards.appspot.com',
  messagingSenderId: '563260328800',
  appId: '1:563260328800:web:485d1b84a522870bb7ac05',
  measurementId: 'G-9GRBWJ0BJ8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

export const Shared = () => {
  const { Id } = useParams();

  const [cards, setCards] = useState([]);

  // Add a new document in collection "cities"
  // useEffect(() => {
  // const lsCards = localStorage.getItem('cards');
  // const cards = JSON.parse(lsCards.replace(/(<([^>]+)>)/gi, ''));
  // const cleanCards = cards.map((card) => {
  //   delete card.link;
  //   return {
  //     ...card,
  //     datasheet: card.datasheet
  //       .filter((sheet) => sheet.active)
  //       .map((sheet) => {
  //         delete sheet.link;
  //         return sheet;
  //       }),
  //     keywords: card.keywords.filter((keyword) => keyword.active),
  //     wargear: card.wargear.filter((wargear) => wargear.active),
  //     abilities: card.abilities.filter((ability) => ability.showAbility),
  //   };
  // });
  // addDoc(collection(db, 'shares'), { cards: cleanCards });
  // }, []);

  useEffect(() => {
    if (Id) {
      getDoc(doc(db, 'shares', Id)).then((dc) => {
        setCards(dc.data().cards);
      });
    }
  }, [Id]);

  return (
    <Layout>
      <Header>
        <Row style={{ justifyContent: 'space-between' }}>
          <Col>
            <Typography.Title level={2} style={{ color: 'white', marginBottom: 0, marginTop: '8px' }}>
              Game Datacards
            </Typography.Title>
          </Col>
          <Col>
            <Space>
              <Button
                className='button-bar'
                style={{ fontSize: '24px' }}
                type='text'
                shape='circle'
                size='large'
                icon={<ShareAltOutlined />}
              />
              <Button
                className='button-bar'
                style={{ fontSize: '24px' }}
                type='text'
                shape='circle'
                size='large'
                icon={<HeartOutlined />}
              />
              <Button className='button-bar' type='ghost' icon={<CodeJson />}>
                Embed
              </Button>
              <Button className='button-bar' type='ghost' icon={<ForkOutlined />}>
                Fork
              </Button>
            </Space>
          </Col>
        </Row>
      </Header>
      <Content>
        <div className='flex' style={{ pageBreakAfter: 'always', gridTemplateColumns: `1fr 1fr 1fr` }}>
          {cards.map((card, index) => {
            return <UnitCard unit={card} key={`${card.name}-${index}`} />;
          })}
        </div>
      </Content>
    </Layout>
  );
};

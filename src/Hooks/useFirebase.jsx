import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getDoc, getFirestore, increment, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';

const firebaseConfig = {
  apiKey: 'AIzaSyBRdhA0nJqt2XZwaBWEoRrHxN77sOH2rkY',
  authDomain: 'game-datacards.firebaseapp.com',
  projectId: 'game-datacards',
  storageBucket: 'game-datacards.appspot.com',
  messagingSenderId: '563260328800',
  appId: '1:563260328800:web:485d1b84a522870bb7ac05',
  measurementId: 'G-9GRBWJ0BJ8',
};

const FirebaseContext = React.createContext(undefined);

export function useFirebase() {
  const context = React.useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('`useFirebase` must be used with an `FirebaseProvider`');
  }
  return context;
}

export const FirebaseProviderComponent = (props) => {
  const [currentDoc, setCurrentDoc] = useState();

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const db = getFirestore(app);

  const shareCategory = (category) => {
    const cleanCards = category.cards.map((card) => {
      delete card.link;
      return {
        ...card,
        datasheet: card.datasheet
          .filter((sheet) => sheet.active)
          .map((sheet) => {
            delete sheet.link;
            return sheet;
          }),
        keywords: card.keywords.filter((keyword) => keyword.active),
        wargear: card.wargear.filter((wargear) => wargear.active),
        abilities: card.abilities.filter((ability) => ability.showAbility),
      };
    });
    console.log(category);
    return addDoc(collection(db, 'shares'), {
      category: { ...category, cards: cleanCards },
      description: '',
      likes: 0,
      views: 0,
      version: process.env.REACT_APP_VERSION,
      createdAt: new Date().toISOString(),
      website: 'https://game-datacards.eu',
    });
  };

  const getCategory = async (Id) => {
    if (!Id) {
      return null;
    }
    const docRef = doc(db, 'shares', Id);
    const category = await getDoc(docRef);

    await updateDoc(docRef, {
      views: increment(1),
    });
    return category.data();
  };

  const likeCategory = async (Id) => {
    if (!Id) {
      return null;
    }

    const docRef = doc(db, 'shares', Id);

    return updateDoc(docRef, {
      likes: increment(1),
    });
  };

  const context = {
    shareCategory,
    getCategory,
    likeCategory,
  };

  return <FirebaseContext.Provider value={context}>{props.children}</FirebaseContext.Provider>;
};

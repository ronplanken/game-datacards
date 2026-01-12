import { getAnalytics, logEvent, setUserProperties } from "firebase/analytics";
import { initializeApp, registerVersion } from "firebase/app";
import { addDoc, collection, doc, getDoc, getFirestore, increment, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyBRdhA0nJqt2XZwaBWEoRrHxN77sOH2rkY",
  authDomain: "game-datacards.firebaseapp.com",
  projectId: "game-datacards",
  storageBucket: "game-datacards.appspot.com",
  messagingSenderId: "563260328800",
  appId: "1:563260328800:web:485d1b84a522870bb7ac05",
  measurementId: "G-9GRBWJ0BJ8",
};

const FirebaseContext = React.createContext(undefined);

export function useFirebase() {
  const context = React.useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("`useFirebase` must be used with an `FirebaseProvider`");
  }
  return context;
}

export const FirebaseProviderComponent = (props) => {
  const [currentDoc, setCurrentDoc] = useState();

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  setUserProperties(analytics, { app_version: import.meta.env.VITE_VERSION });

  const db = getFirestore(app);

  useEffect(() => {
    logLocalEvent();
  }, []);

  const shareCategory = (category) => {
    const cleanCards = category.cards.map((card) => {
      delete card.link;
      if (card.cardType === "datasheet") {
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
      }
      return card;
    });

    const newDoc = {
      category: { ...category, cards: cleanCards },
      description: "",
      likes: 0,
      views: 0,
      version: import.meta.env.VITE_VERSION || "dev",
      createdAt: new Date().toISOString(),
      website: "https://game-datacards.eu",
    };
    return addDoc(collection(db, "shares"), newDoc);
  };

  const logScreenView = (screen, extras) => {
    logEvent(analytics, "screen_view", {
      firebase_screen: screen,
      ...extras,
    });
  };

  const logLocalEvent = (event, extras) => {
    logEvent(analytics, event, {
      ...extras,
    });
  };

  const getCategory = async (Id) => {
    if (!Id) {
      return null;
    }
    const docRef = doc(db, "shares", Id);
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

    const docRef = doc(db, "shares", Id);

    return updateDoc(docRef, {
      likes: increment(1),
    });
  };

  const context = {
    shareCategory,
    getCategory,
    likeCategory,
    logLocalEvent,
    logScreenView,
  };

  return <FirebaseContext.Provider value={context}>{props.children}</FirebaseContext.Provider>;
};

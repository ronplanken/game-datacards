import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { message } from "../Components/Toast/message";

const ServiceMessagesContext = React.createContext(undefined);

const defaultSettings = {
  lists: [],
  selectedList: -1,
  setSelectedList: () => {},
  addDatacard: () => {},
  removeDatacard: () => {},
};

export function useServiceMessages() {
  const context = React.useContext(ServiceMessagesContext);
  if (context === undefined) {
    throw new Error("`useServiceMessages` must be used with an `ServiceMessagesProvider`");
  }
  return context;
}

export const ServiceMessagesProvider = (props) => {
  const [messages, setMessages] = React.useState(() => {
    try {
      const messages = localStorage.getItem("messages");
      if (messages) {
        return JSON.parse(messages);
      }
      return [];
    } catch (e) {
      message.error("An error occored while trying to load the service messages.");
      return [];
    }
  });

  return <ServiceMessagesContext.Provider value={context}>{props.children}</ServiceMessagesContext.Provider>;
};

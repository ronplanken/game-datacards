import { Button, Modal, Space, Tooltip, Typography } from "antd";
import React from "react";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

import { confirmable, ConfirmDialog, createConfirmation } from "react-confirm";

const ConfirmChangesModal = (props) => (
  <Modal
    title={props.title}
    onCancel={() => props.proceed(false)}
    visible={props.show}
    footer={[
      <Button
        key="Cancel"
        onClick={() => {
          props.proceed(false);
        }}>
        Cancel
      </Button>,
      <Button
        key="Discard"
        type="ghost"
        onClick={() => {
          props.handleDiscard();
          props.proceed(true);
        }}>
        Discard changes
      </Button>,
      <Button
        key="Save"
        type="primary"
        onClick={() => {
          props.handleSave();
          props.proceed(true);
        }}>
        Save
      </Button>,
    ]}>
    Do you want to save before switching cards?
  </Modal>
);

export const confirmDialog = createConfirmation(confirmable(ConfirmChangesModal));

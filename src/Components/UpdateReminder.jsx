import { Button, Col, Row, Popover, Typography, message } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import { DatabaseOutlined, LoadingOutlined } from "@ant-design/icons";
import moment from "moment";

export const UpdateReminder = () => {
  const [isUpdateReminderVisible, setIsUpdateReminderVisible] = React.useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);

  const { dataSource, checkForUpdate } = useDataSourceStorage();

  useEffect(() => {
    if (
      (dataSource.lastCheckedForUpdate && moment().diff(moment(dataSource.lastCheckedForUpdate), "days") > 4) ||
      compare(dataSource.version, process.env.REACT_APP_VERSION, "<")
    ) {
      setIsUpdateReminderVisible(true);
    } else {
      setIsUpdateReminderVisible(false);
    }
  }, [dataSource]);

  return (
    <>
      {isUpdateReminderVisible && (
        <Popover
          title={"Update datasources"}
          content={"It has been a while since you updated your datasources. Please check for updates!"}
          overlayStyle={{ width: "250px" }}
          placement="topRight"
          arrowPointAtCenter={true}>
          <div
            className="updatereminder-background"
            style={{
              position: "absolute",
              right: "32px",
              bottom: "32px",
              height: "96px",
              width: "96px",
              borderRadius: "128px",
              backgroundColor: "#001529",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              zIndex: "9999",
            }}
            onClick={() => {
              setCheckingForUpdate(true);
              checkForUpdate().then(() => {
                setCheckingForUpdate(false);
                message.success("The datasource has been successfully updated.");
              });
            }}>
            {!checkingForUpdate && <DatabaseOutlined style={{ fontSize: "48px", color: "white" }} />}
            {checkingForUpdate && <LoadingOutlined style={{ fontSize: "48px", color: "white" }} />}
          </div>
        </Popover>
      )}
    </>
  );
};

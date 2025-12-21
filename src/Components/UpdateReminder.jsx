import { Database, Loader2 } from "lucide-react";
import { Popover, message } from "antd";
import { compare } from "compare-versions";
import moment from "moment";
import React, { useEffect } from "react";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";

export const UpdateReminder = () => {
  const [isUpdateReminderVisible, setIsUpdateReminderVisible] = React.useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);

  const { dataSource, checkForUpdate } = useDataSourceStorage();

  useEffect(() => {
    if (
      (dataSource.lastCheckedForUpdate && moment().diff(moment(dataSource.lastCheckedForUpdate), "days") > 2) ||
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
            {!checkingForUpdate && <Database size={48} color="white" />}
            {checkingForUpdate && <Loader2 size={48} color="white" className="animate-spin" />}
          </div>
        </Popover>
      )}
    </>
  );
};

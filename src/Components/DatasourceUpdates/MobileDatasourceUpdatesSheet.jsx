import React from "react";
import { MobileModal } from "../Viewer/Mobile/MobileModal";
import { useDatasourceUpdates } from "./useDatasourceUpdates";
import { DatasourceUpdatesBody, plural } from "./DatasourceUpdatesBody";

export const MobileDatasourceUpdatesSheet = ({
  isOpen,
  onClose,
  title = "Compare with datasource",
  cards = [],
  dataSource,
  selectedDataSource,
  language = "en",
  onApply,
}) => {
  const state = useDatasourceUpdates({ isOpen, cards, dataSource, selectedDataSource, language });

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} title={title} zIndex={1002}>
      <div className="dsu-mobile" data-testid="dsu-mobile">
        <DatasourceUpdatesBody state={state} language={language} />
        <div className="dsu-mobile-footer">
          {state.changed.length > 0 ? (
            <button
              className="dsu-mobile-submit"
              onClick={() => onApply(state.results, state.selectedUuids)}
              type="button"
              disabled={state.selectedUuids.length === 0}>
              Update {plural(state.selectedUuids.length, "card")}
            </button>
          ) : (
            <button className="dsu-mobile-submit" onClick={onClose} type="button">
              Close
            </button>
          )}
        </div>
      </div>
    </MobileModal>
  );
};

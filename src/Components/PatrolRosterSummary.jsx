import { patrolRosterLabel } from "../Helpers/datasource11e.helpers";

export const PatrolRosterSummary = ({ card }) => {
  const label = patrolRosterLabel(card);
  return label ? <small style={{ display: "block", fontWeight: 400, opacity: 0.75 }}>{label}</small> : null;
};

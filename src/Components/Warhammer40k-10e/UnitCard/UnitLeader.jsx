export const UnitLeader = ({ leader }) => {
  const parts = leader.split(" ■ ");

  return (
    <div className="leader_container">
      <div className="heading">
        <div className="title">Leader</div>
      </div>
      <span className="description">{parts[0]}</span>
      {parts.slice(1).map((o, index) => (
        <div className="description" key={index}>
          {"■ "}
          {o}
        </div>
      ))}
    </div>
  );
};

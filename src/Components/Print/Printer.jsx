export const Printer = ({ faction, size, children, style }) => {
  return (
    <div
      style={{
        ...style,
      }}
      className="printer">
      {children}
    </div>
  );
};

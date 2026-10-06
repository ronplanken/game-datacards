import "./ActiveItemToolbar.css";

/**
 * A toolbar of icon-only action buttons grouped by logical sections,
 * separated by vertical dividers. Shared between Card Designer and Datasource Editor.
 *
 * @param {Array<Array<{icon: Component, onClick: Function, title: string, ariaLabel: string, danger?: boolean, disabled?: boolean}>>} groups
 *   Array of groups, each group is an array of button configs.
 * @param {React.ReactNode} children - Additional elements (e.g. sync icons) appended after the groups.
 */
export const ActiveItemToolbar = ({ groups = [], children }) => {
  return (
    <div className="active-item-toolbar">
      {groups.map((group, gi) => (
        <div key={gi} className="active-item-toolbar-group">
          {gi > 0 && <span className="active-item-toolbar-divider" />}
          {group.map((btn, bi) => {
            const Icon = btn.icon;
            return (
              <button
                key={bi}
                className={`active-item-toolbar-btn${btn.danger ? " danger" : ""}`}
                onClick={btn.onClick}
                title={btn.title}
                aria-label={btn.ariaLabel || btn.title}
                disabled={btn.disabled}>
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      ))}
      {children}
    </div>
  );
};

import { Fragment } from "react";
import { getUnitLinkEntries, getUnitLinkGroups, resolveUnitLink } from "../../../../Helpers/unitLinks.helpers";
import { useUnitLinkContext } from "./UnitLinkContext";

const missingStyle = { color: "#999", textDecoration: "line-through", cursor: "not-allowed" };

const UnitLinkName = ({ link, onNavigate, className, underline = false }) => {
  if (link.missing) {
    return (
      <span className={className} style={missingStyle} title="This card no longer exists in the datasource">
        {link.name || "Unknown unit"}
      </span>
    );
  }

  if (link.card && onNavigate) {
    const handleActivate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onNavigate(link);
    };
    return (
      <span
        className={className}
        role="link"
        tabIndex={0}
        style={underline ? { cursor: "pointer", textDecoration: "underline" } : { cursor: "pointer" }}
        data-testid="ds-unit-link"
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") handleActivate(event);
        }}>
        {link.name}
      </span>
    );
  }

  return <span className={className}>{link.name}</span>;
};

const useResolvedGroups = (card, cardTypeDef) => {
  const { factions, onNavigate } = useUnitLinkContext();
  const groups = getUnitLinkGroups(cardTypeDef)
    .filter((group) => card?.showUnitLinks?.[group.key] !== false)
    .map((group) => ({
      group,
      links: getUnitLinkEntries(card, group.key)
        .filter((entry) => entry.cardId || entry.name)
        .map((entry) => resolveUnitLink(entry, factions)),
    }))
    .filter(({ links }) => links.length > 0);
  return { groups, onNavigate };
};

const Ds40kUnitLinks = ({ groups, onNavigate }) => (
  <div className="composition_container ds-unit-links" data-testid="ds-unit-links">
    {groups.map(({ group, links }) => (
      <Fragment key={group.key}>
        <div className="heading">
          <div className="title">{group.label}</div>
        </div>
        <div className="leader" data-testid={`ds-unit-links-${group.key}`}>
          {group.description && <span className="description">{group.description}</span>}
          {links.map((link, index) => (
            <div key={`${group.key}-${link.cardId || link.name}-${index}`}>
              ■
              <UnitLinkName link={link} onNavigate={onNavigate} className="value" />
            </div>
          ))}
        </div>
      </Fragment>
    ))}
  </div>
);

const InlineLinkList = ({ links, onNavigate, groupKey }) =>
  links.map((link, index) => (
    <Fragment key={`${groupKey}-${link.cardId || link.name}-${index}`}>
      {index > 0 && ", "}
      <UnitLinkName link={link} onNavigate={onNavigate} underline />
    </Fragment>
  ));

const AosUnitLinks = ({ groups, onNavigate, grandAlliance }) => (
  <div className="ds-aos-sections-list ds-unit-links" data-testid="ds-unit-links">
    {groups.map(({ group, links }) => (
      <div className={`ability-wrapper ${grandAlliance || ""}`} key={group.key}>
        <div className={`ability-box ${grandAlliance || ""}`} data-testid={`ds-unit-links-${group.key}`}>
          <div className="ability-strip">
            <span className="ability-name">{group.label}</span>
          </div>
          <div className="ability-text">
            {group.description && <div>{group.description}</div>}
            <InlineLinkList links={links} onNavigate={onNavigate} groupKey={group.key} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const StarcraftUnitLinks = ({ groups, onNavigate }) => (
  <>
    {groups.map(({ group, links }) => (
      <div className="sc-phase-row ds-unit-links" key={group.key} data-testid={`ds-unit-links-${group.key}`}>
        <div className="sc-section-heading">
          <span>{group.label}</span>
        </div>
        <div className="sc-section-body">
          {group.description && <span>{group.description} </span>}
          <InlineLinkList links={links} onNavigate={onNavigate} groupKey={group.key} />
        </div>
      </div>
    ))}
  </>
);

const CustomUnitLinks = ({ groups, onNavigate }) => (
  <div className="ds-unit-links" data-testid="ds-unit-links">
    {groups.map(({ group, links }) => (
      <div className="ability" key={group.key} data-name={group.label} data-testid={`ds-unit-links-${group.key}`}>
        <span className="title">{group.label}</span>
        {group.description && <span className="description">{group.description}</span>}
        <span className="value">
          <InlineLinkList links={links} onNavigate={onNavigate} groupKey={group.key} />
        </span>
      </div>
    ))}
  </div>
);

export const DsUnitLinks = ({ card, cardTypeDef, variant = "40k", grandAlliance }) => {
  const { groups, onNavigate } = useResolvedGroups(card, cardTypeDef);
  if (groups.length === 0) return null;

  switch (variant) {
    case "aos":
      return <AosUnitLinks groups={groups} onNavigate={onNavigate} grandAlliance={grandAlliance} />;
    case "starcraft":
      return <StarcraftUnitLinks groups={groups} onNavigate={onNavigate} />;
    case "custom":
      return <CustomUnitLinks groups={groups} onNavigate={onNavigate} />;
    default:
      return <Ds40kUnitLinks groups={groups} onNavigate={onNavigate} />;
  }
};

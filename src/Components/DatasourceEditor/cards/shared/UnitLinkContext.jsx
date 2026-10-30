import { createContext, useCallback, useContext, useMemo } from "react";
import { useInRouterContext, useLocation, useNavigate } from "react-router-dom";
import { getUnitLinkViewerPath } from "../../../../Helpers/unitLinks.helpers";

const UnitLinkContext = createContext({ factions: null, onNavigate: null });

export const UnitLinkProvider = ({ factions, onNavigate, children }) => {
  const value = useMemo(() => ({ factions: factions || null, onNavigate: onNavigate || null }), [factions, onNavigate]);
  return <UnitLinkContext.Provider value={value}>{children}</UnitLinkContext.Provider>;
};

export const useUnitLinkContext = () => useContext(UnitLinkContext);

const RoutedUnitLinkProvider = ({ factions, children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mobile = pathname.startsWith("/mobile");
  const onNavigate = useCallback(
    (link) => {
      const path = getUnitLinkViewerPath(link, { mobile });
      if (path) navigate(path);
    },
    [navigate, mobile],
  );
  return (
    <UnitLinkProvider factions={factions} onNavigate={onNavigate}>
      {children}
    </UnitLinkProvider>
  );
};

export const ViewerUnitLinkProvider = ({ factions, navigable = true, children }) => {
  const inRouter = useInRouterContext();
  if (!navigable || !inRouter) {
    return <UnitLinkProvider factions={factions}>{children}</UnitLinkProvider>;
  }
  return <RoutedUnitLinkProvider factions={factions}>{children}</RoutedUnitLinkProvider>;
};

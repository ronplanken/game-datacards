import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import logo from "../Images/logo.png";
import { NotFound } from "./NotFound";
import "./NotFound.css";

/**
 * Route-level error boundary, wired as the router's `errorElement`. It catches
 * errors thrown while rendering or loading a route and shows a branded page
 * instead of React Router's default "Unexpected Application Error". A thrown
 * 404 response falls through to the standard NotFound page.
 */
export const RouteErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  const status = isRouteErrorResponse(error) ? error.status : null;
  const detail = isRouteErrorResponse(error)
    ? error.statusText || error.data
    : error instanceof Error
      ? error.message
      : null;

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <img src={logo} alt="Game Datacards" className="notfound-logo" />
        <div className="notfound-code">{status || "Error"}</div>
        <h1 className="notfound-title">Something went wrong</h1>
        <p className="notfound-text">
          An unexpected error occurred while loading this page. Please reload and try again. If it keeps happening, let
          us know on Discord.
        </p>
        {detail ? <pre className="notfound-detail">{String(detail)}</pre> : null}
        <div className="notfound-actions">
          <button type="button" className="notfound-button" onClick={() => window.location.reload()}>
            Reload page
          </button>
          <Link to="/" className="notfound-button notfound-button--ghost">
            Back to Game Datacards
          </Link>
        </div>
      </div>
    </div>
  );
};

import { Link } from "react-router-dom";
import logo from "../Images/logo.png";
import "./NotFound.css";

/**
 * Application-wide 404 page used as the router's catch-all (`path: "*"`) so an
 * unmatched route renders this branded page instead of React Router's default
 * "Unexpected Application Error". Thrown route errors are handled separately by
 * RouteErrorBoundary.
 */
export const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <img src={logo} alt="Game Datacards" className="notfound-logo" />
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-text">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-button">
            Back to Game Datacards
          </Link>
        </div>
      </div>
    </div>
  );
};

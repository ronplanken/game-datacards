import { useEffect, useState } from "react";
import { get40k11eDataVersions } from "../Helpers/external.helpers";

export const use11eDataVersions = (enabled = true) => {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setIsLoading(true);
    get40k11eDataVersions()
      .then((result) => {
        if (!cancelled) {
          setVersions(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { versions, isLoading, error };
};

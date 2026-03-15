/**
 * Parse subscription limit error from database trigger.
 * Returns { resource, current, limit, tier } or null.
 */
export const parseSubscriptionLimitError = (errorMessage) => {
  if (!errorMessage) return null;
  const match = errorMessage.match(/SUBSCRIPTION_LIMIT_EXCEEDED:(\w+):(\d+):(\d+);(\w+)/);
  if (match) {
    return {
      resource: match[1],
      current: parseInt(match[2], 10),
      limit: parseInt(match[3], 10),
      tier: match[4],
    };
  }
  return null;
};

/**
 * Generate or retrieve a persistent device ID for filtering own realtime events.
 * Uses localStorage so the ID persists across page reloads, avoiding false
 * version conflicts when the user refreshes.
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem("gdc-device-id");
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("gdc-device-id", deviceId);
  }
  return deviceId;
};

/**
 * Run a debounced sync for items that match a pending predicate.
 * Tracks which items are pending via pendingRef (a Set), and only
 * triggers syncFn when new pending items appear.
 *
 * Call inside a useEffect, return the cleanup function it returns.
 *
 * @param {Object} opts
 * @param {Array} opts.items - Array of items to check
 * @param {Function} opts.isPending - Predicate: (item) => boolean
 * @param {Function} opts.getKey - Extract unique key: (item) => string
 * @param {Function} opts.syncFn - Function to call after debounce
 * @param {React.MutableRefObject} opts.timeoutRef - Ref holding setTimeout id
 * @param {React.MutableRefObject} opts.pendingRef - Ref holding Set of pending keys
 * @param {number} opts.delay - Debounce delay in ms
 * @returns {Function} cleanup function to clear timeout
 */
export function runDebouncedSync({ items, isPending, getKey, syncFn, timeoutRef, pendingRef, delay }) {
  const pendingItems = items.filter(isPending);
  const currentPending = new Set(pendingItems.map(getKey));

  const hasNewPending = [...currentPending].some((key) => !pendingRef.current.has(key));

  if (hasNewPending && pendingItems.length > 0) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      syncFn();
    }, delay);
  }

  pendingRef.current = currentPending;

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}

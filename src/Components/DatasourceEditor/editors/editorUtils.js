import { nanoid } from "nanoid";

/** Ensure every item in an array has a stable _id */
export const ensureIds = (items) => (items || []).map((item) => (item._id ? item : { ...item, _id: nanoid() }));

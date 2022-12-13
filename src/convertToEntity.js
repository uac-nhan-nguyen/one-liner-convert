import {decode} from "./decoder.js";

export const convertToEntity = (s) => {
  const [c] = decode(s);
  return {
    type: c.type,
    statuses: c.arrays?.['statuses'],
  }
}
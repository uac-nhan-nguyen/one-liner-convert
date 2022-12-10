import {decode} from "./decoder.js";

export const convertToJsonSchema = (s) => {
  const decoded = decode(s);
  return {
    type: 'object',
    properties: {
      'name': {type: 'string'},
    }
  }
}

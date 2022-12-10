import {decode} from "./decoder.js";

export const convertToJsonSchema = (s) => {
  const [c] = decode(s);

  const convert = (statement) => {
    if (statement.children) {
      const properties = {}
      statement.children.forEach((child) => {
        properties[child.name] = convert(child)
      })
      return {
        type: 'object',
        properties,
      }
    } else {
      return {
        type: statement.type
      }
    }
  }
  return convert(c)

}

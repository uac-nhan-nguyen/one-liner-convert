import {decode} from "./decoder.js";

export const convertToJsonSchema = (s) => {
  const [c] = decode(s);

  const convert = (statement) => {
    const props = {};
    if (statement.children) {
      const properties = {}
      statement.children.forEach((child) => {
        properties[child.name] = convert(child)
      })
      const isArray = statement.childrenBracket === '[';
      props['type'] = isArray ? 'array' : 'object';
      if (isArray) {
        if (statement.type) {
          props['items'] = {
            type: statement.type
          }
        } else {

          props['items'] = {
            type: 'object',
            properties,
          }
        }
      } else {
        props['properties'] = properties;
      }
    } else {
      props['type'] = statement.type;
      if (statement.options?.['format']) props['format'] = statement.options['format']
      if (statement.options?.['pattern']) props['pattern'] = statement.options['pattern']
    }
    if (statement.nameNullable) props['nullable'] = true
    return props;
  }
  return convert(c)

}

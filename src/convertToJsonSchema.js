export const convertToJsonSchema = (s) => {
  return {
    type: 'object',
    properties: {
      'name': {type: 'string'},
    }
  }
}

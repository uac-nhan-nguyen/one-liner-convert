import {convertToJsonSchema} from "./convertToJsonSchema.js";

describe('In convert to json schema', () => {
  test('convert type', () => {
    expect(convertToJsonSchema(':string')).toEqual({type: 'string',  })
    expect(convertToJsonSchema(': number')).toEqual({type: 'number',  })
    expect(convertToJsonSchema('{}')).toEqual({type: 'object',  })
  })
  test('convert object', () => {
    expect(convertToJsonSchema('{name: string}')).toEqual({type: 'object',
      required: ['name'],
      properties: {
        'name': {type: 'string'},
      }
    })

    expect(convertToJsonSchema(`
    {
      name: string
      email: string format(email)
      phone?: string 
      children: [
        name: string
        age?: number
      ]
      data?: {
        count: number
      }
      arrayNumber: number []
    }
    `)).toEqual({
      type: 'object',
      required: ['name', 'email', 'children', 'arrayNumber'],
      properties: {
        'name': {type: 'string'},
        'email': {type: 'string', format: 'email'},
        'phone': {nullable: true, type: 'string'},
        'children': {
          type: 'array',
          items: {
            type: 'object',
            required: ['name'],
            properties: {
              'name': {type: 'string'},
              'age': {nullable: true, type: 'number'},
            },
          }
        },
        'data': {
          type: 'object',
          nullable: true,
          required: ['count'],
          properties: {
            'count': {type: 'number'},
          }
        },
        'arrayNumber': {
          type: 'array',
          items: {type: 'number'}
        }
      }
    });
  })
})
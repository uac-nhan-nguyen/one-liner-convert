# one-liner-converter

Convert one line declarative codes to other format like json schema

## Convert to JSON schema

```
IN:
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

OUT:
{
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
}
```

import {decode, decompose, mergeSpaces} from "./decoder.js";

describe('In decoder utilities', () => {
  test('decompose generals', () => {
    expect(decompose(`
    name: type
    `)).toEqual([';', 'name', ":", "type", ';'])
    expect(decompose(`
    {
    name: type
    }
    `)).toEqual([';', '{', ';', 'name', ':', 'type', ';', '}', ';'])
    expect(decompose('name : type option(value) -f --flag')).toEqual(['name', ':', 'type', 'option(value)', '-f', '--flag'])
    expect(decompose('name option(value)')).toEqual(['name',  'option(value)'])
  })
})

describe('In decoder', () => {
  test('simple string', () => {
    expect(decode('name: type')).toEqual([{
      name: 'name',
      type: 'type'
    }])
    expect(decode(';name: type')).toEqual([{
      name: 'name',
      type: 'type'
    }])
    expect(decode(';name: type;')).toEqual([{
      name: 'name',
      type: 'type'
    }])
    expect(decode(';name: type;name')).toEqual([{
      name: 'name',
      type: 'type'
    }, {name: 'name'}])
  })

  test('parent name and type', () => {
    expect(decode(`
    parent: object {
      name: type
      name: type
    }
    `)).toEqual([{
      name: 'parent', type: 'object',
      childrenBracket: '{',
      children: [
        {name: 'name', type: 'type'},
        {name: 'name', type: 'type'},
      ]
    }])
  })

  test('children from bracket', () => {
    expect(decode(`
    {
      name: type
      name: type
    }
    `)).toEqual([{
      childrenBracket: '{',
      children: [
        {name: 'name', type: 'type'},
        {name: 'name', type: 'type'},
      ]
    }])
  })

  test('bracket type', () => {
    expect(decode(`{}`)).toEqual([{children: [], childrenBracket: '{'}])
    expect(decode(`[]`)).toEqual([{children: [], childrenBracket: '['}])
  })

  test('recursive children', () => {
    expect(decode(`
    {
      child: type {
        name: type
      }
    }
    `)).toEqual([{
      childrenBracket: '{',
      children: [
        {
          name: 'child', type: 'type',
          childrenBracket: '{',
          children: [
            {name: 'name', type: 'type'},
          ]
        },
      ]
    }])
  })

  test('options', () => {
    expect(decode(`option(value)`)).toEqual([{
      options: {'option': 'value'}
    }])
    expect(decode(`option((){}^/[?:]/$)`)).toEqual([{
      options: {'option': '(){}^/[?:]/$'}
    }])
    expect(decode(`o1(1) o1(2) o2(3) o4()`)).toEqual([{
      options: {'o1': '2', 'o2': '3', 'o4': ''}
    }])
  })

  test('flags', () => {
    expect(decode(`-f --flag --f`)).toEqual([{
      flags: ['-f', '--flag', '--f']
    }])
  })

  test('nullable', () => {
    expect(decode(`nullable?: string`)).toEqual([{name: 'nullable', nameNullable: true, type: 'string'}])
    expect(decode(`not: string?`)).toEqual([{name: 'not', type: 'string', typeNullable: true}])
    expect(decode(`not: string option() ?`)).toEqual([{name: 'not', type: 'string', options: {'option': ""} }])
  })

  test('whole example', () => {
    expect(decode(`
    parent: object {
      name: string --required
      email: string format(email) 
      age?: number
    }
    `)).toEqual([{
      name: 'parent', type: 'object',
      childrenBracket: '{',
      children: [
        {
          name: 'name', type: 'string', flags: ['--required']
        },
        {
          name: 'email', type: 'string',
          options: {
            'format': 'email'
          }
        },
        {
          name: 'age', type: 'number', nameNullable: true
        }
      ]
    }])
  })
})
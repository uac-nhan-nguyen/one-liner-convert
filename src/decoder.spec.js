import {decode, decompose, mergeSpaces} from "./decoder.js";

describe('In decoder utilities', () => {
  test('nextWord', () => {
    expect(decompose(`
    name: type
    `)).toEqual([';', 'name', ":", "type", ';'])

    expect(decompose(`
    {
    name: type
    }
    `)).toEqual([';', '{', ';', 'name', ':', 'type', ';', '}', ';'])
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
      children: [
        {name: 'name', type: 'type'},
        {name: 'name', type: 'type'},
      ]
    }])
  })

  test('recursive children', () => {
    expect(decode(`
    {
      child: type {
        name: type
      }
    }
    `)).toEqual({
      children: [
        {
          name: 'child', type: 'type',
          children: [
            {name: 'name', type: 'type'},
          ]
        },
      ]
    })
  })
})
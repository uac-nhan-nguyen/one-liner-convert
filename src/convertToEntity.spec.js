import {convertToEntity} from "./convertToEntity.js";

describe('In convert to entity', () => {
  test('convert one string', () => {
    expect(convertToEntity(`:Student`)).toEqual({
      type: 'Student',
    })

    expect(convertToEntity(`:Student statuses[New,Registered]`)).toEqual({
      type: 'Student',
      statuses: ['New', 'Registered'],
    })
  })
})
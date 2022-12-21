import {DynamoQuery} from "./convertToDynamoQuery.js";

describe('In convert to dynamo query', () => {
  const q = new DynamoQuery({tableName: 'table-name'})
  test('query PK', () => {
    expect(q.createQuery(`:Entity id=pk1`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1'},
    })

    expect(q.createQuery(`pk=LEARNER#`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'LEARNER#'},
    })

    expect(q.createQuery(`:Entity id=New sk~Coder#`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
      ExpressionAttributeNames: {'#PK': 'PK', '#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#New', ":SK": 'Coder#'},
    })

    expect(q.createQuery(`id=New :Entity  sk=#`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND #SK = :SK',
      ExpressionAttributeNames: {'#PK': 'PK', '#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#New', ":SK": '#'},
    })
  })

  test('options', () => {
    expect(q.createQuery(`pk=LEARNER# limit(100) --inverse`)).toEqual({
      TableName: 'table-name',
      Limit: 100,
      ScanIndexForward: false,
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'LEARNER#'},
    })

    expect(q.createQuery(`pk=LEARNER# limit(100) --rcu --inverse`)).toEqual({
      TableName: 'table-name',
      Limit: 100,
      ScanIndexForward: false,
      ReturnConsumedCapacity: "TOTAL",
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'LEARNER#'},
    })
  })

  test('query gsi', () => {
    expect(q.createQuery(`gsi=1 pk=Entity#New`)).toEqual({
      TableName: 'table-name',
      IndexName: 'gsi1-index',
      KeyConditionExpression: '#GSI1PK = :GSI1PK',
      ExpressionAttributeNames: {'#GSI1PK': 'GSI1PK'},
      ExpressionAttributeValues: {':GSI1PK': 'Entity#New'},
    })

    expect(q.createQuery(`:Entity gsi=1`)).toEqual({
      TableName: 'table-name',
      IndexName: 'gsi1-index',
      KeyConditionExpression: '#GSI1PK = :GSI1PK',
      ExpressionAttributeNames: {'#GSI1PK': 'GSI1PK'},
      ExpressionAttributeValues: {':GSI1PK': 'Entity'},
    })

    expect(q.createQuery(`gsi=1 pk=Entity#New sk~Coder#`)).toEqual({
      TableName: 'table-name',
      IndexName: 'gsi1-index',
      KeyConditionExpression: '#GSI1PK = :GSI1PK AND begins_with(#GSI1SK, :GSI1SK)',
      ExpressionAttributeNames: {'#GSI1PK': 'GSI1PK', '#GSI1SK': 'GSI1SK'},
      ExpressionAttributeValues: {':GSI1PK': 'Entity#New', ":GSI1SK": 'Coder#'},
    })
  })
})

describe('DynamoConvert can convert lines of transaction, query, update', () => {
  const q = new DynamoQuery({tableName: 'table-name'})

  test('get command', () => {
    expect(q.create(`get pk=Entity#pk1 sk=#`)).toEqual({
      TableName: 'table-name',
      Key: {
        PK: 'Entity#pk1',
        SK: '#'
      }
    })
  })

  test('query command', () => {
    expect(q.create(`query pk=Entity#pk1`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1'},
    })

    expect(q.create(`query pk=Entity#pk1`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1'},
    })

    expect(q.create(`query pk=Entity#pk1 sk~Class#`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
      ExpressionAttributeNames: {'#PK': 'PK', '#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1', ':SK': "Class#"},
    })

    expect(q.create(`query :Entity id=pk1`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1'},
    })
  })


  test('bugs', () => {
    expect(q.create('')).toEqual(null)
    expect(q.create(null)).toEqual(null)
    expect(q.create(undefined)).toEqual(null)
  })
})
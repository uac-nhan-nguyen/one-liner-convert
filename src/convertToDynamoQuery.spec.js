import {DynamoQuery} from "./convertToDynamoQuery.js";

describe('In convert to dynamo query', () => {
  const q = new DynamoQuery({tableName: 'table-name'})
  test('query PK', () => {
    expect(q.createQuery(`Entity id=pk1`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1'},
    })

    expect(q.createQuery(`Entity pk(LEARNER#)`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'LEARNER#'},
    })

    expect(q.createQuery(`Entity id=New begins_with(Coder#)`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
      ExpressionAttributeNames: {'#PK': 'PK','#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#New', ":SK": 'Coder#'},
    })

    expect(q.createQuery(`Entity id=New sk(#)`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND #SK = :SK',
      ExpressionAttributeNames: {'#PK': 'PK','#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#New', ":SK": '#'},
    })
  })
  test('query gsi', () => {
    expect(q.createQuery(`Entity gsi=1 status=New`)).toEqual({
      TableName: 'table-name',
      IndexName: 'gsi1-index',
      KeyConditionExpression: '#GSI1PK = :GSI1PK',
      ExpressionAttributeNames: {'#GSI1PK': 'GSI1PK'},
      ExpressionAttributeValues: {':GSI1PK': 'Entity#New'},
    })

    expect(q.createQuery(`Entity gsi=1`)).toEqual({
      TableName: 'table-name',
      IndexName: 'gsi1-index',
      KeyConditionExpression: '#GSI1PK = :GSI1PK',
      ExpressionAttributeNames: {'#GSI1PK': 'GSI1PK'},
      ExpressionAttributeValues: {':GSI1PK': 'Entity'},
    })

    expect(q.createQuery(`Entity gsi=1 status=New begins_with(Coder#)`)).toEqual({
      TableName: 'table-name',
      IndexName: 'gsi1-index',
      KeyConditionExpression: '#GSI1PK = :GSI1PK AND begins_with(#GSI1SK, :GSI1SK)',
      ExpressionAttributeNames: {'#GSI1PK': 'GSI1PK','#GSI1SK': 'GSI1SK'},
      ExpressionAttributeValues: {':GSI1PK': 'Entity#New', ":GSI1SK": 'Coder#'},
    })
  })
})
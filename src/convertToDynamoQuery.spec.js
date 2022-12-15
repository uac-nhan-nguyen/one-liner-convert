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

    expect(q.createQuery(`pk(LEARNER#)`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'LEARNER#'},
    })

    expect(q.createQuery(`:Entity id=New begins_with(Coder#)`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND begins_with(#SK, :SK)',
      ExpressionAttributeNames: {'#PK': 'PK', '#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#New', ":SK": 'Coder#'},
    })

    expect(q.createQuery(`id=New :Entity  sk(#)`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK AND #SK = :SK',
      ExpressionAttributeNames: {'#PK': 'PK', '#SK': 'SK'},
      ExpressionAttributeValues: {':PK': 'Entity#New', ":SK": '#'},
    })
  })

  test('options', () => {
    expect(q.createQuery(`:Entity pk(LEARNER#) limit=100 --inverse`)).toEqual({
      TableName: 'table-name',
      Limit: 100,
      ScanIndexForward: false,
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'LEARNER#'},
    })

    expect(q.createQuery(`pk(LEARNER#) limit=100 --rcu --inverse`)).toEqual({
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
    expect(q.createQuery(`:Entity gsi=1 status=New`)).toEqual({
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

    expect(q.createQuery(`:Entity gsi=1 status=New begins_with(Coder#)`)).toEqual({
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

  test('query command', () => {
    expect(q.create(`query :Entity id=pk1`)).toEqual({
      TableName: 'table-name',
      KeyConditionExpression: '#PK = :PK',
      ExpressionAttributeNames: {'#PK': 'PK'},
      ExpressionAttributeValues: {':PK': 'Entity#pk1'},
    })
  })

  test('put command', () => {
    const props = {'item': {name: "Nhan Nguyen"}}
    const now = Date.now();
    expect(q.create('put :Entity id=pk1 item=$item', {props, timestamp: now})).toMatchObject({
      TableName: 'table-name',
      Item: {
        PK: `Entity#pk1`, SK: '#',
        GSI1PK: `Entity`,
        GSI1SK: `${now}`,
        name: "Nhan Nguyen",
      },
    })
  })

  test('update command', () => {
    const props = {'data': {'name': "Nhan Nguyen"}}
    const now = Date.now();
    expect(q.create('update :Entity id=pk1 data=$data', {props, timestamp: now})).toEqual({
      TableName: 'table-name',
      Key: {
        PK: `Entity#pk1`, SK: '#',
      },
      UpdateExpression: "SET #updatedAt = :updatedAt, #data = :data",
      ExpressionAttributeNames: {
        "#updatedAt": "updatedAt",
        "#data": "data"
      },
      ExpressionAttributeValues: {
        ":updatedAt": now,
        ":data": {
          'name': "Nhan Nguyen"
        },
      }
    })
  })

  test('multiple commands', () => {
    const props = {'item': {name: "Nhan Nguyen"}, 'name': "Nhan Nguyen"}
    const now = Date.now();
    expect(q.create(`[
      put :Entity id=pk1 item=$item
      update :Entity id=pk2 name=$name
    ]`, {timestamp: now})).toEqual({
      TransactionItems: [
        {
          Put: {
            TableName: 'table-name',
            Item: {
              PK: `Entity#pk1`, SK: '#',
              GSI1PK: `Entity`,
              GSI1SK: `${now}`,
            },
          }
        },
        {
          Update: {
            TableName: 'table-name',
            Key: {
              PK: `Entity#pk2`, SK: '#',
            },
            UpdateExpression: "SET #updatedAt = :updatedAt, #name = :name",
            ExpressionAttributeNames: {
              "#updatedAt": "updatedAt",
              "#name": "name"
            },
            ExpressionAttributeValues: {
              ":updatedAt": now,
              ":name": "$name",
            }
          }
        }
      ]
    });
  })
})
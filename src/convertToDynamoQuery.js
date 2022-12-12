import {decode} from "./decoder.js";

export class DynamoQuery {
  #tableName;

  #gsi(n) {
    return {
      IndexName: `gsi${n}-index`,
      PK: `GSI${n}PK`,
      SK: `GSI${n}SK`,
    }
  }

  constructor({tableName}) {
    this.#tableName = tableName;
  }

  createQuery(s) {
    const [c] = decode(s);
    const {gsi, pk, id, begins_with, sk, status, limit} = c.options ?? {};

    const entity = c.name;

    const ans = {
      TableName: this.#tableName,
    }
    const {PK, SK, IndexName} = gsi ? this.#gsi(gsi) : {PK: 'PK', SK: 'SK'};

    if (IndexName) ans['IndexName'] = IndexName;

    ans.KeyConditionExpression = `#${PK} = :${PK}`
    ans.ExpressionAttributeNames = {[`#${PK}`]: PK}

    if (pk) {
      ans.ExpressionAttributeValues = {[`:${PK}`]: `${pk}`}
    } else if (id) {
      ans.ExpressionAttributeValues = {[`:${PK}`]: `${entity}#${id}`}
    } else if (status) {
      ans.ExpressionAttributeValues = {[`:${PK}`]: `${entity}#${status}`}
    } else {
      ans.ExpressionAttributeValues = {[`:${PK}`]: `${entity}`}
    }

    if (limit) {
      ans.Limit = parseInt(limit);
    }

    if (c.flags?.includes('--rcu')) {
      ans.ReturnConsumedCapacity = "TOTAL";
    }

    if (c.flags?.includes('--inverse')) {
      ans.ScanIndexForward = false;
    }


    if (begins_with) {
      ans.KeyConditionExpression += ` AND begins_with(#${SK}, :${SK})`;
      ans.ExpressionAttributeNames[`#${SK}`] = SK
      ans.ExpressionAttributeValues[`:${SK}`] = begins_with;
    }

    if (sk) {
      ans.KeyConditionExpression += ` AND #${SK} = :${SK}`;
      ans.ExpressionAttributeNames[`#${SK}`] = SK
      ans.ExpressionAttributeValues[`:${SK}`] = sk;
    }

    return ans;
  }
}
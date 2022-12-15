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

  create(s, {props, timestamp} = {}) {
    const [c] = decode(s);
    return this.#create(c, {props, timestamp});
  }

  #create(c, {props, timestamp} = {}) {
    console.log(c)
    if (c.children && c.children.length > 0 && c.childrenBracket === '[') {
      const ans = [];

      c.children.forEach((child) => {
        const key = {
          'query': 'Query',
          'put': 'Put',
          'update': 'Update',
          'delete': 'Delete',
        }[child.name] ?? 'Unknown'

        ans.push({[key]: this.#create(child, {props, timestamp})})
      })
      return {
        TransactionItems: ans
      };

    } else if (c.name === 'query') {
      return this.#createQuery(c)
    } else if (c.name === 'put') {
      return this.#createPut(c, {props, timestamp})
    } else if (c.name === 'update') {
      return this.#createUpdate(c, {props, timestamp})
    }
  }

  createPut(s, {props, timestamp} = {}) {
    const [c] = decode(s);
    return this.#createPut(c, {props, timestamp});
  }

  #createPut(c, {props, timestamp}) {
    const now = timestamp ?? Date.now()
    const {id, item, ...others} = c.options ?? {};
    const entity = c.type;

    let item_ = {}
    if (item && props) {
      const [, param] = item.split('$');
      if (param) {
        item_ = props[param];
      }
    }

    const ans = {
      TableName: this.#tableName,
      Item: {
        SK: '#',
        ...item_,
      },
    }

    if (entity && id) {
      ans.Item['PK'] = `${entity}#${id}`;
    }

    if (entity) {
      ans.Item['GSI1PK'] = `${entity}`;
      ans.Item['GSI1SK'] = `${now}`;
    }


    return ans;
  }


  createUpdate(s, {props, timestamp}) {
    const [c] = decode(s);
    return this.#createUpdate(c, {props, timestamp});
  }

  #createUpdate(c, {props, timestamp}) {
    const now = timestamp ?? Date.now();
    const entity = c.type;
    const {id, ...others} = c.options ?? {};

    const updateExpressionParams = {
      set: ['#updatedAt = :updatedAt']
    }

    const ans = {
      TableName: this.#tableName,
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ":updatedAt": now,
      },
    }

    if (entity && id) {
      ans['Key'] = {
        PK: `${entity}#${id}`,
        SK: '#'
      }
    }

    Object.entries(others).map(([key, value]) => {
      if (value) {
        const [, param] = value.split('$')
        if (param) {
          ans.ExpressionAttributeNames[`#${key}`] = key;
          ans.ExpressionAttributeValues[`:${key}`] = props?.[param] ?? value;
          updateExpressionParams.set.push(`#${key} = :${key}`);
        }
      }
    })

    ans.UpdateExpression = buildUpdateExpression(updateExpressionParams)

    return ans;
  }

  createQuery(s) {
    const [c] = decode(s);
    return this.#createQuery(c);
  }

  #createQuery(c) {
    const {gsi, pk, id, begins_with, sk, status, limit} = c.options ?? {};

    const entity = c.type;

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

/**
 * helpers to build UpdateExpression
 */
export function buildUpdateExpression({
                                        set,
                                        remove,
                                        add,
                                        del,
                                      }) {
  let ans = '';
  set = set?.filter((i) => i);
  if (set && set.length > 0) {
    ans += 'SET ' + set.join(', ');
  }

  remove = remove?.filter((i) => i);
  if (remove && remove.length > 0) {
    ans += ' REMOVE ' + remove.join(', ');
  }

  add = add?.filter((i) => i);
  if (add && add.length > 0) {
    ans += ' REMOVE ' + add.join(', ');
  }

  let _delete = del?.filter((i) => i);
  if (_delete && _delete.length > 0) {
    ans += ' REMOVE ' + _delete.join(', ');
  }

  return ans.length > 0 ? ans : undefined;
}

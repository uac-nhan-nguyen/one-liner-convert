/**
 * Decode string recursively to object tree
 * @param s
 */
export const decode = (s) => {
  const all = decompose(s)

  const _decode = (a) => {
    const children = []

    let child = {};
    children.push(child);

    let nextIsType = -10;
    let i = 0
    let justName = -10;
    let justType = -10;

    /// loop
    for (; i < a.length; i++) {
      const c = a[i];
      const option = matchOption(c)
      const array = matchArray(c)
      if (isFlag(c)) {
        if (child['flags'] == null) child['flags'] = [];
        child['flags'].push(c)
      } else if (option != null) {
        if (child['options'] == null) child['options'] = {};
        child['options'][option[1]] = option[2]
      } else if (array != null) {
        if (child['arrays'] == null) child['arrays'] = {};
        child['arrays'][array[1]] = array[2].split(',')

      } else if (isName(c)) {
        if (nextIsType === i - 1) {
          child['type'] = c
          justType = i
        } else {
          child['name'] = c
          justName = i
        }
      } else if (c === '?') {
        if (justName === i - 1) {
          child['nameNullable'] = true
        } else if (justType === i - 1) {
          child['typeNullable'] = true
        }

      } else if (c === ':') {
        nextIsType = i
      } else if (c === ';') {
        if (Object.entries(child).length > 0) {
          child = {};
          children.push(child)
        }
      } else if (c === '{' || c === '[') {
        child['childrenBracket'] = c;
        const [_children, skip] = _decode(a.slice(i + 1));
        i += skip + 1
        child['children'] = _children;
      } else if (c === '}' || c === ']') {
        break;
      }

    }

    return [children.filter((i) => Object.entries(i).length > 0), i]
  }

  const [ans,] = _decode(all)
  return ans;
}

const isName = (s) => {
  return s.match(/^[\w-]+$/) != null;
}

const optionRegex = /(\w+)\(([^\n)]*)\)/
const arrayRegex = /(\w+)\[([^\n\]]*)]/

const matchOption = (s) => s.match(optionRegex) ?? s.match(/(\w+)=([^\s;]*)/)
const matchArray = (s) => s.match(arrayRegex)

const isFlag = (s) => s.match(/^(-|--)\w+/) != null


export const decompose = (s) => {
  const m = [...mergeSpaces(s).matchAll(/(\w+)\(([^\n)]*)\)|(\w+)\[([^\n\]]*)]|(\w+)=([^\s;]*)|[\w-]+|\?|:|{|}|;|\[|]/g)];
  return m.map((i) => i[0]);
}

export const mergeSpaces = (s) => {
  return s.replaceAll(/ +/g, ' ').replaceAll('\n', ';')
}
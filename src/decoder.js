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

    let nextIsType = false;
    let i = 0
    let justName = -1;
    let justType = -1;

    /// loop
    for (; i < a.length; i++) {
      const c = a[i];
      const option = matchOption(c)
      if (isFlag(c)) {
        if (child['flags'] == null) child['flags'] = [];
        child['flags'].push(c)
      } else if (option != null) {
        if (child['options'] == null) child['options'] = {};
        child['options'][option[1]] = option[2]
      } else if (isName(c)) {
        if (nextIsType) {
          child['type'] = c
          nextIsType = false
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
        nextIsType = true
      } else if (c === ';') {
        nextIsType = false
        if (Object.entries(child).length > 0) {
          child = {};
          children.push(child)
        }
      } else if (c === '{' || c === '[') {
        child['childrenBracket'] = c;
        const [_children, skip] = _decode(a.slice(i + 1));
        i += skip
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

const matchOption = (s) => s.match(/(\w+)\((\S*)\)/)

const isFlag = (s) => s.match(/^(-|--)\w+/) != null


export const decompose = (s) => {
  const m = [...mergeSpaces(s).matchAll(/(\w+)\((\S*)\)|[\w-]+|\?|:|{|}|;|\[|]/g)];
  return m.map((i) => i[0]);
}

export const mergeSpaces = (s) => {
  return s.replaceAll(/ +/g, ' ').replaceAll('\n', ';')
}
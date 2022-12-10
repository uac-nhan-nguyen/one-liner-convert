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

    /// loop
    for (; i < a.length; i++){
      const c = a[i];
      if (isName(c)){
        if (nextIsType){
          child['type'] = c
          nextIsType = false
        }
        else {
          child['name'] = c
        }
      }
      else if (c === ':'){
        nextIsType = true
      }
      else if (c === ';'){
        nextIsType = false
        if (Object.entries(child).length > 0){
          child = {};
          children.push(child)
        }
      }
      else if (c === '{'){
        const [_children, skip] = _decode(a.slice(i+ 1));
        i += skip
        child['children'] = _children;
      }
      else if (c === '}') {
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


export const decompose = (s) => {
  const m = [...mergeSpaces(s).matchAll(/[\w-]+|:|{|}|;|\[|]/g)];
  return m.map((i) => i[0]);
}

export const mergeSpaces = (s) => {
  return s.replaceAll(/ +/g, ' ').replaceAll('\n', ';')
}
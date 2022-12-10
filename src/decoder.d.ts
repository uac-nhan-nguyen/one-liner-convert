type Statement = {
  name?: string,
  type?: string,
  children?: Statement[]
  childrenBracket?: '{' | '['

  flags?: (`-${string}` | `--${string}`)[],
  options?: { [k: string]: string },
  nameNullable?: true,
  typeNullable?: true,
}

export function decode(s: string): Statement[]
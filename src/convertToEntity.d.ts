type EntityDefinition = {
  type?: string,            // used in PK={type}#{id} and GSI1PK={type}
  statuses?: string[]       // used in GSI1PK={type}#{status}
  pk?: string,              // used in PK={pk} and SK={id}
  beginsWithSk?: string,    // used in PK={pk} and SK={beginsWithSk}#{id}
}


export function convertToEntity(s: string): EntityDefinition
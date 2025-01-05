export interface ExtractedVars {
  required?: string[];
  optional?: string[];
}

export function extractVariables(prompt: string): ExtractedVars {
  const required: string[] = [];
  const optional: string[] = [];

  const pattern =
    /{{#(\w+)}}([\s\S]*?){{\/\1}}|{{\^(\w+)}}([\s\S]*?){{\/\3}}|{{(\w+)}}/g;

  let match;
  while ((match = pattern.exec(prompt)) !== null) {
    if (match[1]) {
      // #condition => optional
      optional.push(match[1].trim());
    } else if (match[3]) {
      // ^condition => optional
      optional.push(match[3].trim());
    } else if (match[5]) {
      // unconditional => required
      required.push(match[5].trim());
    }
  }

  return {
    required: [...new Set(required)],
    optional: [...new Set(optional.filter((opt) => !required.includes(opt)))],
  };
}

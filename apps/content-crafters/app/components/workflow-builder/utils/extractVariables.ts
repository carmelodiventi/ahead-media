export interface ExtractedVars {
  required?: string[];
  optional?: string[];
}

export function extractVariables(prompt: string): ExtractedVars {
  const required: string[] = [];
  const optional: string[] = [];

  // Simple regex for mustache patterns:
  // {{var}}, {{#condition}}...{{/condition}}, {{^condition}}...{{/condition}}
  const pattern =
    /{{#(\w+)}}([\s\S]*?){{\/\1}}|{{\^(\w+)}}([\s\S]*?){{\/\3}}|{{(\w+)}}/g;

  let match;
  while ((match = pattern.exec(prompt)) !== null) {
    if (match[1]) {
      // #condition => optional
      optional.push(match[1]);
    } else if (match[3]) {
      // ^condition => optional
      optional.push(match[3]);
    } else if (match[5]) {
      // unconditional => required
      required.push(match[5]);
    }
  }

  return { required, optional };
}

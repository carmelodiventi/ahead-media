export const extractJsonKeys = (json: object): string[] => {
  const keys: string[] = [];
  const traverse = (obj: object, parent = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const path = parent ? `${parent}.${key}` : key;
      keys.push(path);
      if (typeof value === 'object' && value !== null) {
        traverse(value, path);
      }
    });
  };
  traverse(json);
  return keys;
};

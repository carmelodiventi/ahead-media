export function mapDynamicInputs(
  item: any,
  inputMapping: Record<string, string>,
  initialInputs: Record<string, any>,
  stepResults: Record<string, any>
): Record<string, any> {
  const dynamicInputs: Record<string, any> = {};
  for (const [key, value] of Object.entries(inputMapping)) {
    if (value === 'for_each_field') {
      dynamicInputs[key] = item;
    } else if (value.startsWith('initialInput')) {
      dynamicInputs[key] = initialInputs[value.split('.')[1]];
    } else if (stepResults[value]) {
      dynamicInputs[key] = stepResults[value];
    } else {
      dynamicInputs[key] = item[value];
    }
  }
  return dynamicInputs;
}

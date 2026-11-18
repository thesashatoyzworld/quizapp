// Port of stripUnknown from reels-optimizer prompts/kallaway/runs/run.mjs (the validated runner).
// The model occasionally adds keys the schema does not declare (e.g. "id": null in a hook);
// drop them before saving and rendering.

export type JsonSchema = {
  $ref?: string;
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  definitions?: Record<string, JsonSchema>;
  [k: string]: unknown;
};

export function stripUnknown(
  sch: JsonSchema,
  val: unknown,
  defs: Record<string, JsonSchema> | undefined = sch.definitions,
): unknown {
  if (sch.$ref && defs) sch = defs[sch.$ref.split('/').pop() as string];
  if (Array.isArray(val) && sch.items) return val.map((v) => stripUnknown(sch.items as JsonSchema, v, defs));
  if (val && typeof val === 'object' && !Array.isArray(val) && sch.properties) {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(val)) {
      if (sch.properties[k]) o[k] = stripUnknown(sch.properties[k], (val as Record<string, unknown>)[k], defs);
    }
    return o;
  }
  return val;
}

/**
 * Minimal Standard Schema v1 types + a validation helper.
 *
 * We deliberately depend only on the interop spec (https://standardschema.dev),
 * never on a specific validator. Devs bring Zod, Valibot, ArkType — anything
 * that implements `~standard`. This is the Skillet-avoidance decision: no
 * bespoke schema language, zero learning curve.
 */

/**
 * The minimal [Standard Schema](https://standardschema.dev) v1 surface this
 * package relies on — implemented by Zod, Valibot, ArkType, and others.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': StandardSchemaV1.Props<Input, Output>;
}

export namespace StandardSchemaV1 {
  export interface Props<Input = unknown, Output = Input> {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => Result<Output> | Promise<Result<Output>>;
    readonly types?: Types<Input, Output>;
  }

  export type Result<Output> = SuccessResult<Output> | FailureResult;

  export interface SuccessResult<Output> {
    readonly value: Output;
    readonly issues?: undefined;
  }

  export interface FailureResult {
    readonly issues: ReadonlyArray<Issue>;
  }

  export interface Issue {
    readonly message: string;
    readonly path?: ReadonlyArray<PropertyKey | PathSegment>;
  }

  export interface PathSegment {
    readonly key: PropertyKey;
  }

  export interface Types<Input = unknown, Output = Input> {
    readonly input: Input;
    readonly output: Output;
  }
}

/** The normalized result of {@link validateStandard}: either a value or issues. */
export interface ValidationOutcome<Output> {
  /** True when the value passed validation. */
  readonly valid: boolean;
  /** The (possibly transformed) output value when valid. */
  readonly value?: Output;
  /** Flat list of human-readable messages when invalid. */
  readonly errors: readonly string[];
}

/**
 * Run a Standard Schema validator and normalize the result into a flat outcome
 * the components can consume. Awaits async validators transparently.
 */
export async function validateStandard<Output>(
  schema: StandardSchemaV1<unknown, Output>,
  value: unknown,
): Promise<ValidationOutcome<Output>> {
  const result = await schema['~standard'].validate(value);
  if (result.issues) {
    return { valid: false, errors: result.issues.map((i) => i.message) };
  }
  return { valid: true, value: result.value, errors: [] };
}

/** Duck-type check that an unknown value is a Standard Schema. */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return (
    typeof value === 'object' &&
    value !== null &&
    '~standard' in value &&
    typeof (value as StandardSchemaV1)['~standard']?.validate === 'function'
  );
}

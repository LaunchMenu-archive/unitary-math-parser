/** Merges the properties from B into A recursively */
export type TReplaceProperties<A, B> = A extends object
    ? B extends object
        ? {
              [K in keyof A]: K extends keyof B ? TReplaceProperties<A[K], B[K]> : A[K];
          }
        : B
    : B;

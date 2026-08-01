import { describe, it, expect } from "vitest";
import { assignBucketRef } from "../imageGenerator.helpers";

describe("assignBucketRef", () => {
  it("creates a bucket on demand for a previously unseen faction id (e.g. Adeptus Titanicus)", () => {
    const buckets = {};
    // "AT" is not pre-seeded; this used to throw
    // ("can't access property 0, buckets['AT'] is undefined").
    expect(() => assignBucketRef(buckets, "AT", 0, "node-0")).not.toThrow();
    expect(buckets.AT).toEqual(["node-0"]);
  });

  it("assigns nodes at their index and preserves earlier entries", () => {
    const buckets = {};
    assignBucketRef(buckets, "SM", 0, "front-0");
    assignBucketRef(buckets, "SM", 3, "front-3");
    expect(buckets.SM[0]).toBe("front-0");
    expect(buckets.SM[3]).toBe("front-3");
    expect(buckets.SM).toHaveLength(4);
  });

  it("keeps separate buckets per faction id", () => {
    const buckets = {};
    assignBucketRef(buckets, "AT", 0, "at-0");
    assignBucketRef(buckets, "TAU", 0, "tau-0");
    expect(buckets.AT).toEqual(["at-0"]);
    expect(buckets.TAU).toEqual(["tau-0"]);
  });

  it("stores null on unmount without discarding the bucket", () => {
    const buckets = { AT: ["at-0"] };
    assignBucketRef(buckets, "AT", 0, null);
    expect(buckets.AT[0]).toBeNull();
  });

  it("is a no-op for a missing bucket object or faction id", () => {
    expect(() => assignBucketRef(null, "AT", 0, "x")).not.toThrow();
    const buckets = {};
    assignBucketRef(buckets, undefined, 0, "x");
    expect(buckets).toEqual({});
  });
});

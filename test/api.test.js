const fs = require("fs");
const api = require("../src/index.js");

describe("Test unified-range API", () => {
  test("Test semver full way", () => {
    const semverRanges = fs
      .readFileSync("test/data/semver-ranges.txt", "utf-8")
      .split("\n");
    const expectedSemverRanges = fs
      .readFileSync("test/data/expected-semver-ranges.txt", "utf-8")
      .split("\n");

    const results = [];
    semverRanges.forEach((rng) => {
      const unified = api.fromSemver(rng);
      const semverAgain = api.toSemver(String(unified));
      results.push(String(semverAgain));
    });
    expect(results).toEqual(expectedSemverRanges);
  });

  test("Test comma-separated semver", () => {
    const semverRanges = fs
      .readFileSync("test/data/semver-ranges.txt", "utf-8")
      .split("\n");
    const expectedSemverRangesCommaSeparated = fs
      .readFileSync(
        "test/data/expected-semver-ranges-comma-separated.txt",
        "utf-8"
      )
      .split("\n");

    const results = [];
    semverRanges.forEach((rng) => {
      const unified = api.fromSemver(rng);
      const semverWithComma = api.toSemverCommaSeparated(String(unified));
      results.push(String(semverWithComma));
    });
    expect(results).toEqual(expectedSemverRangesCommaSeparated);
  });

  test("Test unified full way", () => {
    const unifiedRanges = fs
      .readFileSync("test/data/unified-ranges.txt", "utf-8")
      .split("\n");
    const expectedUnifiedRanges = fs
      .readFileSync("test/data/expected-unified-ranges.txt", "utf-8")
      .split("\n");

    const results = [];
    unifiedRanges.forEach((rng) => {
      const semver = api.toSemver(rng);
      const unified = api.fromSemver(String(semver));
      results.push(String(unified));
    });
    expect(results).toEqual(expectedUnifiedRanges);
  });
});

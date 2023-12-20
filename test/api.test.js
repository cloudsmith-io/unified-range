const fs = require("fs");
const api = require("../src/index.js");

describe("API", () => {
  describe("filterVersions", () => {
    test("return versions that match range", () => {
      const results = api.filterVersions(
        ["0.1", "0.2", "1.0", "1.1", "2.0"],
        ["[,0.2]", "[1.1]"]
      );
      expect(results).toEqual(["0.1", "0.2", "1.1"]);
    });

    test("return versions that do not match range", () => {
      const results = api.filterVersions(
        ["0.1", "0.2", "1.0", "1.1", "2.0"],
        ["[,0.2]", "[1.1]"],
        false
      );
      expect(results).toEqual(["1.0", "2.0"]);
    });
  });

  describe("nextFilteredVersion", () => {
    test("return next version that matches range", () => {
      const result = api.nextFilteredVersion(
        "0.2",
        ["0.1", "0.2", "1.0", "1.1", "2.0"],
        ["[,0.2]", "[1.1]"]
      );
      expect(result).toEqual("0.2");
    });

    test("return next version that does not match range", () => {
      const result = api.nextFilteredVersion(
        "0.2",
        ["0.1", "0.2", "1.0", "1.1", "2.0"],
        ["[,0.2]", "[1.1]"],
        false
      );
      expect(result).toEqual("1.0");
    });
  });

  describe("maximumFilteredVersion", () => {
    test("return next version that matches range", () => {
      const result = api.maximumFilteredVersion(
        ["0.1", "0.2", "1.0", "1.1", "2.0"],
        ["[,0.2]", "[1.1]"]
      );
      expect(result).toEqual("1.1");
    });

    test("return next version that does not match range", () => {
      const result = api.maximumFilteredVersion(
        ["0.1", "0.2", "1.0", "1.1", "2.0"],
        ["[,0.2]", "[1.1]"],
        false
      );
      expect(result).toEqual("2.0");
    });
  });

  describe("Conversions", () => {
    test("semver full way", () => {
      const semverRanges = fs
        .readFileSync("test/data/semver-ranges.txt", "utf-8")
        .split("\n");
      const expectedSemverRanges = fs
        .readFileSync("test/data/expected-semver-ranges.txt", "utf-8")
        .split("\n");

      const results = [];
      semverRanges.forEach((rng) => {
        const unified = api.fromSemver(rng);
        const semverAgain = api.toSemver(unified);
        results.push(semverAgain);
      });
      expect(results).toEqual(expectedSemverRanges);
    });

    test("comma-separated semver", () => {
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

    test("unified full way", () => {
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
});

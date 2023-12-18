const utils = require("../src/utils");

const testNpmSemverRanges = [
  "*",
  "1.2.3",
  "2.0.0 || 2.1.0",
  "<0.1.2",
  "<=0.12.7",
  "<5.6.5 || >=6 <6.0.1",
  "<2.0.20180219",
  "<1.3.0-rc.4",
  "<0.0.0",
  "<0.10.0 >=0.9.0",
  "<2.11.2 || >=3.0.0 <3.6.4 ||  >=4.0.0 <4.5.7 || >=5.0.0 <5.2.1",
];
const expectedVersionRange = [
  "(,)",
  "[1.2.3]",
  "[2.0.0],[2.1.0]",
  "(,0.1.2)",
  "(,0.12.7]",
  "(,5.6.5),[6,6.0.1)",
  "(,2.0.20180219)",
  "(,1.3.0-rc.4)",
  "(,0.0.0)",
  "[0.9.0,0.10.0)",
  "(,2.11.2),[3.0.0,3.6.4),[4.0.0,4.5.7),[5.0.0,5.2.1)",
];

const expectedNpmSemverRange = [
  "*",
  "1.2.3",
  "2.0.0 || 2.1.0",
  "<0.1.2",
  "<=0.12.7",
  "<5.6.5 || >=6 <6.0.1",
  "<2.0.20180219",
  "<1.3.0-rc.4",
  "<0.0.0",
  ">=0.9.0 <0.10.0",
  "<2.11.2 || >=3.0.0 <3.6.4 || >=4.0.0 <4.5.7 || >=5.0.0 <5.2.1",
];

const expectedCommaSeparatedSemverRange = [
  "*",
  "1.2.3",
  "2.0.0 || 2.1.0",
  "<0.1.2",
  "<=0.12.7",
  "<5.6.5 || >=6, <6.0.1",
  "<2.0.20180219",
  "<1.3.0-rc.4",
  "<0.0.0",
  ">=0.9.0, <0.10.0",
  "<2.11.2 || >=3.0.0, <3.6.4 || >=4.0.0, <4.5.7 || >=5.0.0, <5.2.1",
];

const beforeClean = [
  // npm
  "=3.0.0-rc.1",
  "=v3.7.2",
  "=5.0.2",
  ">1.2.3",
  "<=2.4",
  "<v1.2.3",
  "<=v2.4.6",
];

const expectedCleanSemver = [
  // npm
  "3.0.0-rc.1",
  "3.7.2",
  "5.0.2",
  ">1.2.3",
  "<=2.4",
  "<1.2.3",
  "<=2.4.6",
];

const beforeTrim = [
  // npm
  "<  2.0.5",
  "< 1.12.4 || >= 2.0.0 <2.0.2",
  "<= 0.0.1",
  "<= 2.15.0 || >= 3.0.0 <= 3.8.2",
  ">= 0.0.10 <= 0.0.14",
  ">= 1.0.0-rc.1 <1.0.0-rc.1.1 || >= 1.0.0-rc.2 <1.0.0-rc.2.1 ",
  // composer
  " >=8.0, <8.4.5",
  "< 1.15.2",
  ">0.7.1, <1.0.4",
  ">= 3.1, <=3.1.9",
  "< 2.1.27.9",

  // ruby
  "< 0.13.3, > 0.11.0",
  "< 0.10.0",
  "< 0.14.1.1, >= 0.13.3",
  "< 1.0.0.rc1.1",
  "< 1.3.0.pre.8",
  "<0.30.0 ,>=0.27.0",
  ">= 2.3.0, <= 2.3.10",
];

const expectedComparatorTrimmed = [
  "<2.0.5",
  "<1.12.4 || >=2.0.0 <2.0.2",
  "<=0.0.1",
  "<=2.15.0 || >=3.0.0 <=3.8.2",
  ">=0.0.10 <=0.0.14",
  ">=1.0.0-rc.1 <1.0.0-rc.1.1 || >=1.0.0-rc.2 <1.0.0-rc.2.1",
  // composer
  ">=8.0 <8.4.5",
  "<1.15.2",
  ">0.7.1 <1.0.4",
  ">=3.1 <=3.1.9",
  "<2.1.27.9",
  // ruby
  "<0.13.3 >0.11.0",
  "<0.10.0",
  "<0.14.1.1 >=0.13.3",
  "<1.0.0.rc1.1",
  "<1.3.0.pre.8",
  "<0.30.0 >=0.27.0",
  ">=2.3.0 <=2.3.10",
];

describe("Test createFromSemver", () => {
  test("should match expected version range", () => {
    const results = testNpmSemverRanges.map((semver) =>
      utils.createFromSemver(semver).toString()
    );
    expect(results).toEqual(expectedVersionRange);
  });
});

describe("Test transformToSemver", () => {
  test("should match expected npm semver range", () => {
    const results = expectedVersionRange.map((unified) =>
      utils.transformToSemver(unified, " ")
    );
    expect(results).toEqual(expectedNpmSemverRange);
  });

  test("should match expected comma separated semver range", () => {
    const results = expectedVersionRange.map((unified) =>
      utils.transformToSemver(unified, ", ")
    );
    expect(results).toEqual(expectedCommaSeparatedSemverRange);
  });
});

describe("Test cleanSemver", () => {
  test("should match expected clean semver", () => {
    const results = beforeClean.map((semver) => utils.cleanSemver(semver));
    expect(results).toEqual(expectedCleanSemver);
  });
});

describe("Test comparatorTrim", () => {
  test("should match expected comparator trimmed results", () => {
    const results = beforeTrim.map((semver) => utils.comparatorTrim(semver));
    expect(results).toEqual(expectedComparatorTrimmed);
  });
});

describe("Test transformToSemverFailure", () => {
  test("should throw expected exception", () => {
    testNpmSemverRanges.forEach((semver) => {
      expect(() => {
        utils.transformToSemver(semver, " ");
      }).toThrowError();
    });
  });
});

describe("Test createFromSemverFailure", () => {
  test("should throw expected exception", () => {
    expectedVersionRange.forEach((unified) => {
      expect(() => {
        utils.createFromSemver(unified);
      }).toThrowError();
    });
  });
});

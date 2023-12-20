# unified-range

A port of the [`unified-range`](https://github.com/snyk/unified-range) python package. The library converts input semver ranges to a uniform model, and the other way around, providing objects that are easier to use programmatically. The API of the package has been changed slightly from the original package as documented below.

## Examples of supported ranges

1. npm style semver - `<1.2.3 >=2.0.0`
2. ruby style semver - `<1.2.3, >=2.0.0`
3. maven style version ranges - `[1.2.3,2.1.1), [3.0.0,4.1.1)`

Additionally, use this library to run algorithms on any input version ranges and calculate whether a specific version is included in this range.

## How to use

Following are the different functions you can perform with this library.

### `fromSemver(semverStr)`

Convert a semver range to the uniform string range.

```js
const { fromSemver } = require("unified-range");
const res = fromSemver(">2.0.0 <3.0.0");
// res => '(2.0.0,3.0.0)'
```

### `toSemver(uniformStr)`

Convert a uniform range to a semver range.

```js
const { toSemver } = require("unified-range");
const res = toSemver("(2.0.0,3.0.0)");
// res => '>2.0.0 <3.0.0'
```

### `unifiedRange(uniformStr)`

Convert a uniform range to a `UnifiedVersionRange` object.

```js
const { unifiedRange } = require("unified-range");
const res = unifiedRange(str);
// res => UnifiedVersionRange {...}
```

### `filterVersions(versions, ranges, returnMatches = true)`

Filter an array of versions based on an array of ranges. The versions should be sorted in ascending order, from oldest to newest, and contain all the versions for the package.

Return the versions that match the ranges:

```js
const { filterVersions } = require("unified-range");
const res = filterVersions(
  ["0.1", "0.2", "1.0", "1.1", "2.0"],
  ["[,0.2]", "[1.1]"]
);
// res => ["0.1", "0.2", "1.1"]
```

Return the versions that do not match the ranges:

```js
const { filterVersions } = require("unified-range");
const res = filterVersions(
  ["0.1", "0.2", "1.0", "1.1", "2.0"],
  ["[,0.2]", "[1.1]"],
  false
);
// res => [ '1.0', '2.0' ]
```

### `nextFilteredVersion(currentVersion, versions, ranges, returnMatches = true`

Retrieve the next version from an array of versions based on the current version.

Find next version based on versions included in ranges:

```js
const { nextFilteredVersion } = require("unified-range");
const res = nextFilteredVersion(
  "0.2",
  ["0.1", "0.2", "1.0", "1.1", "2.0"],
  ["[,0.2]", "[1.1]"]
);
// res => '0.2'
```

Find next version based on versions not included in ranges:

```js
const { nextFilteredVersion } = require("unified-range");
const res = nextFilteredVersion(
  "0.2",
  ["0.1", "0.2", "1.0", "1.1", "2.0"],
  ["[,0.2]", "[1.1]"],
  false
);
// res => '1.0'
```

### `maximumFilteredVersion(versions, ranges, returnMatches = true)`

Find the latest version in an array of versions.

Retreive the latest version that is included in the ranges:

```js
const { maximumFilteredVersion } = require("unified-range");
const res = maximumFilteredVersion(
  ["0.1", "0.2", "1.0", "1.1", "2.0"],
  ["[,0.2]", "[1.1]"],
  false
);
// res => '1.1'
```

Retreive the latest version that is not included in the ranges:

```js
const { maximumFilteredVersion } = require("unified-range");
const res = maximumFilteredVersion(
  ["0.1", "0.2", "1.0", "1.1", "2.0"],
  ["[,0.2]", "[1.1]"],
  false
);
// res => '2.0'
```

## Uniform structure examples

Following are the uniform structures used in this library:

Uniform string structure example: (,1.2.3)

### Uniform model examples:

`UnifiedVersionRange.constraints -> List[Restrictions]`

`Restriction.bounds -> Tuple[Bound, Bound]`

`Bound.version -> str`

`Bound.inclusive -> boolean`

## References and prior works

This library was ported from the [`unified-range`](https://github.com/snyk/unified-range) python package. That package was built with the following:

1. Maven’s VersionRange:
   [model](https://github.com/apache/maven/tree/master/maven-artifact/src/main/java/org/apache/maven/artifact/versioning) and [spec](https://maven.apache.org/enforcer/enforcer-rules/versionRanges.html) of maven.
2. https://semver.org/
3. [npm’s semver library](https://www.npmjs.com/package/semver)

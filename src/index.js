const utils = require("./utils.js");
const { UnifiedVersionRange } = require("./models.js");

/**
 * Convert semver string to unified range string.
 * @param {string} semverSpec
 * @return {string} unifiedSpec
 */
function fromSemver(semverSpec) {
  const verRng = utils.createFromSemver(semverSpec);
  return verRng.toString();
}

/**
 * Convert unified range string to semver string.
 * @param {string} spec
 * @return {string} semver
 */
function toSemver(spec) {
  return utils.transformToSemver(spec, " ");
}

/**
 * Convert unified range string to semver string, with
 * comma (and space) separating restrictions in case there are 2.
 * For example: `>1.2.3, <=4.5.6`
 * @param {string} spec
 * @return {string} semver
 */
function toSemverCommaSeparated(spec) {
  return utils.transformToSemver(spec, ", ");
}

/**
 * Return VersionRange for unified range.
 * Only support unified range format.
 * @param {string} spec
 * @return {UnifiedVersionRange} VersionRange instance
 */
function unifiedRange(spec) {
  return UnifiedVersionRange.createFromSpec(spec);
}

/**
 * Return an ordered list of versions that do not satisfy any range.
 * @param {string[]} ascVersions
 * @param {string[]} ranges
 * @return {string[]} ordered list of versions
 */
function filterVersions(ascVersions, ranges, returnMatches = true) {
  const rngsUnified = [];
  for (const rng of ranges) {
    if (utils.isSemverRange(rng)) {
      rngsUnified.push(unifiedRange(fromSemver(rng)));
    } else if (utils.isUnifiedRange(rng)) {
      rngsUnified.push(unifiedRange(rng));
    } else {
      throw new Error(`Not a valid semver or unified/maven range - (${rng})`);
    }
  }

  const notIncluded = utils.notIncludedVersions(ascVersions, rngsUnified);
  if (returnMatches) {
    return utils.arrayWithout(ascVersions, notIncluded);
  } else {
    return notIncluded;
  }
}

/**
 * Return the first version that does not satisfy any range.
 * @param {string} currentVersion
 * @param {string[]} ascVersions
 * @param {string[]} ranges
 * @return {string} minimalVersion
 */
function nextFilteredVersion(
  currentVersion,
  ascVersions,
  ranges,
  returnMatches = true
) {
  if (!ascVersions.includes(currentVersion)) {
    throw new Error("currentVersion given is not part of asc_version");
  }
  let minimalVersion = null;
  const indexCurrentVersion = ascVersions.indexOf(currentVersion);
  const filteredVersions = filterVersions(ascVersions, ranges, returnMatches);
  for (const v of filteredVersions) {
    if (indexCurrentVersion <= ascVersions.indexOf(v)) {
      minimalVersion = v;
      break;
    }
  }
  return minimalVersion;
}

/**
 * Return the first version that does not satisfy any range.
 * @param {string[]} ascVersions
 * @param {string[]} ranges
 * @return {string} first version not satisfying any range
 */
function maximumFilteredVersion(ascVersions, ranges, returnMatches = true) {
  const filteredVersions = filterVersions(ascVersions, ranges, returnMatches);
  if (filteredVersions.length > 0) {
    return filteredVersions[filteredVersions.length - 1];
  } else {
    return null;
  }
}

module.exports = {
  fromSemver,
  toSemver,
  toSemverCommaSeparated,
  unifiedRange,
  filterVersions,
  nextFilteredVersion,
  maximumFilteredVersion,
};

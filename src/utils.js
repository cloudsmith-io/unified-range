const { UnifiedVersionRange, Restriction, Version } = require("./models.js");

const semverOperators = { lt: "<", lte: "<=", gt: ">", gte: ">=", eq: "=" };
const unifiedOperators = { lt: ")", lte: "]", gt: "(", gte: "[" };

function isUnifiedOps(rng) {
  return Object.values(unifiedOperators).some((op) => rng.includes(op));
}

function isSemverOps(rng) {
  return Object.values(semverOperators).some((op) => rng.includes(op));
}

function cleanSemver(semver) {
  const removeEq = semver.replace(/(?<![<>])=?v?(?=.*?)/g, "");
  const removeEqV = removeEq.replace(/(?<=[<>])v?(?=.*?)/g, "");
  return removeEqV.trim();
}

function comparatorTrim(semver) {
  if (semver.includes(",")) {
    semver = semver.replace(/,/g, " ");
  }
  const comparatorTrimRegex = /\s+(?=[^<>|])/g;
  return semver.replace(comparatorTrimRegex, "").trim();
}

function isSemverRange(rng) {
  return isSemverOps(rng) && !isUnifiedOps(rng);
}

function isUnifiedRange(rng) {
  return isUnifiedOps(rng) && !isSemverOps(rng);
}

function transformToSemver(unifiedSpec, separator) {
  const semverOperators = { lt: "<", lte: "<=", gt: ">", gte: ">=" };

  if (isSemverRange(unifiedSpec)) {
    throw new Error("Version ranges seem to already be semver");
  }

  const containsAllVersion = new UnifiedVersionRange(null, [
    Restriction.allVersions(),
  ]);
  const unifiedVersion = UnifiedVersionRange.createFromSpec(unifiedSpec);

  if (unifiedVersion.isEqual(containsAllVersion)) {
    return "*";
  }

  const unifiedRestrictions = unifiedVersion.restrictions;
  const semvers = [];

  for (const restriction of unifiedRestrictions) {
    if (restriction.upperBound.version && restriction.lowerBound.version) {
      if (restriction.lowerBound.version === restriction.upperBound.version) {
        semvers.push(`${restriction.upperBound}`);
      } else {
        let gtGte = semverOperators["gt"];
        if (restriction.hasInclusiveLower) {
          gtGte = semverOperators["gte"];
        }
        let ltLte = semverOperators["lt"];
        if (restriction.hasInclusiveUpper) {
          ltLte = semverOperators["lte"];
        }
        semvers.push(
          `${gtGte}${restriction.lowerBound}${separator}${ltLte}${restriction.upperBound}`
        );
      }
    } else {
      if (restriction.upperBound.version && !restriction.lowerBound.version) {
        let ltLte = semverOperators["lt"];
        if (restriction.hasInclusiveUpper) {
          ltLte = semverOperators["lte"];
        }
        semvers.push(`${ltLte}${restriction.upperBound}`);
      } else if (
        restriction.lowerBound.version &&
        !restriction.upperBound.version
      ) {
        let gtGte = semverOperators["gt"];
        if (restriction.hasInclusiveLower) {
          gtGte = semverOperators["gte"];
        }
        semvers.push(`${gtGte}${restriction.lowerBound}`);
      } else {
        throw new Error("Lower and upper bounds are None");
      }
    }
  }

  return semvers.join(" || ");
}

function createFromSemver(semver) {
  const operators = { lt: "<", lte: "<=", gt: ">", gte: ">=" };

  if (isUnifiedRange(semver)) {
    throw new Error("Version ranges seem to already be maven version range");
  }

  if (!Object.values(operators).some((op) => semver.includes(op))) {
    semver = cleanSemver(semver);
  } else {
    semver = comparatorTrim(semver);
  }

  if (semver === "*") {
    return new UnifiedVersionRange(null, [Restriction.allVersions()]);
  }

  const semverRestrictions = semver.split("||");
  const restrictions = [];

  for (const semverRestriction of semverRestrictions) {
    const constraints = semverRestriction.trim().split(" ");
    let lowerBound = null;
    let hasInclusiveLower = false;
    let upperBound = null;
    let hasInclusiveUpper = false;

    for (const constraint of constraints) {
      const countLessThan = (constraint.match(/</g) || []).length;
      const countGreaterThan = (constraint.match(/>/g) || []).length;

      if (countLessThan > 1 || countGreaterThan > 1) {
        throw new Error("semver range contains </> more than one time.");
      }

      if (constraint.startsWith(operators.lte)) {
        upperBound = constraint.slice(2);
        hasInclusiveUpper = true;
      } else if (constraint.startsWith(operators.gte)) {
        lowerBound = constraint.slice(2);
        hasInclusiveLower = true;
      } else if (constraint.startsWith(operators.lt)) {
        upperBound = constraint.slice(1);
      } else if (constraint.startsWith(operators.gt)) {
        lowerBound = constraint.slice(1);
      } else {
        upperBound = constraint;
        lowerBound = constraint;
        hasInclusiveLower = true;
        hasInclusiveUpper = true;
      }
    }

    let lowerVersion = new Version(null);
    let upperVersion = new Version(null);

    if (lowerBound) {
      lowerVersion = new Version(lowerBound);
    }
    if (upperBound) {
      upperVersion = new Version(upperBound);
    }

    restrictions.push(
      new Restriction(
        lowerVersion,
        hasInclusiveLower,
        upperVersion,
        hasInclusiveUpper
      )
    );
  }

  return new UnifiedVersionRange(null, restrictions);
}

function notIncludedVersions(orderedVersionList, rangesList) {
  function getIndex(verList, ver, include = false) {
    if (ver === null || ver === undefined) {
      return;
    }

    if (verList.includes(ver)) {
      let ret = verList.indexOf(ver);
      if (include) {
        ret = ret + 1;
      }
      return ret;
    } else {
      throw new Error(
        `Version ${ver} couldn't be found in the versions list ${verList}`
      );
    }
  }

  let rstIndices = [];
  const lastIndex = orderedVersionList.length;
  const firstIndex = 0;

  for (const rng of rangesList) {
    for (const rst of rng.constraints) {
      const [lower, upper] = rst.bounds;

      if (lower === upper) {
        if (!lower.version && !upper.version) {
          return [];
        }

        const exactIndex = getIndex(orderedVersionList, lower.version);
        rstIndices.push(new Set([exactIndex]));
        continue;
      }

      let lowerIndex = getIndex(
        orderedVersionList,
        lower.version,
        !lower.inclusive
      );
      let upperIndex = getIndex(
        orderedVersionList,
        upper.version,
        upper.inclusive
      );

      if (lowerIndex !== undefined && upperIndex !== undefined) {
        rstIndices.push(
          new Set(
            Array.from(
              { length: upperIndex - lowerIndex },
              (_, i) => lowerIndex + i
            )
          )
        );
      } else if (lowerIndex !== undefined && upperIndex === undefined) {
        rstIndices.push(
          new Set(
            Array.from(
              { length: lastIndex - lowerIndex },
              (_, i) => lowerIndex + i
            )
          )
        );
      } else if (lowerIndex === undefined && upperIndex !== undefined) {
        rstIndices.push(
          new Set(
            Array.from(
              { length: upperIndex - firstIndex },
              (_, i) => firstIndex + i
            )
          )
        );
      }
    }
  }

  let indToRemove =
    rstIndices.length > 0 ? new Set([...rstIndices]) : new Set();

  let notIncluded = orderedVersionList.filter((v, i) => !indToRemove.has(i));
  return notIncluded;
}

module.exports = {
  isUnifiedOps,
  isSemverOps,
  cleanSemver,
  comparatorTrim,
  isSemverRange,
  isUnifiedRange,
  transformToSemver,
  createFromSemver,
  notIncludedVersions,
};

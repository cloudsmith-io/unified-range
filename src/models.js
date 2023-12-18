class Bound {
  constructor(version, inclusive = false) {
    this.version = version;
    this.inclusive = inclusive;
  }
}

class Version {
  constructor(version) {
    this.version = version;
  }

  toString() {
    return `${this.version}`;
  }

  isEqual(other) {
    if (other instanceof Version) {
      return this.version === other.version;
    } else {
      return false;
    }
  }
}

class Restriction {
  constructor(lowerBound, hasInclusiveLower, upperBound, hasInclusiveUpper) {
    if (!(lowerBound instanceof Version) || !(upperBound instanceof Version)) {
      throw new Error("lowerBound and upperBound must be of type Version");
    }

    this.lowerBound = lowerBound;
    this.hasInclusiveLower = hasInclusiveLower;
    this.upperBound = upperBound;
    this.hasInclusiveUpper = hasInclusiveUpper;
  }

  toString() {
    let buffer = [this.hasInclusiveLower ? "[" : "("];
    if (this.lowerBound.version) {
      buffer.push(this.lowerBound.toString());
    }
    buffer.push(",");
    if (this.upperBound.version) {
      buffer.push(this.upperBound.toString());
    }
    buffer.push(this.hasInclusiveUpper ? "]" : ")");

    if (buffer.length === 5 && buffer[1] === buffer[3]) {
      buffer = ["[", this.lowerBound.toString(), "]"];
    }

    return buffer.join("");
  }

  isEqual(other) {
    if (other instanceof Restriction) {
      const lowerEq = this.lowerBound.isEqual(other.lowerBound);
      const upperEq = this.upperBound.isEqual(other.upperBound);
      const inclusiveLowerEq =
        this.hasInclusiveLower === other.hasInclusiveLower;
      const inclusiveUpperEq =
        this.hasInclusiveUpper === other.hasInclusiveUpper;
      return lowerEq && upperEq && inclusiveLowerEq && inclusiveUpperEq;
    } else {
      return false;
    }
  }

  get bounds() {
    const lower = new Bound(this.lowerBound.version, this.hasInclusiveLower);
    const upper = new Bound(this.upperBound.version, this.hasInclusiveUpper);
    return [lower, upper];
  }

  static allVersions() {
    return new Restriction(new Version(null), false, new Version(null), false);
  }
}

class UnifiedVersionRange {
  constructor(recommendedVersion, restrictions) {
    this.recommendedVersion = recommendedVersion;
    this.restrictions = restrictions;
  }

  toString() {
    if (this.recommendedVersion !== null) {
      return this.recommendedVersion.toString();
    } else {
      const buffer = this.restrictions.map((r) => r.toString());
      return buffer.join(",");
    }
  }

  isEqual(other) {
    const restrictionsEq =
      JSON.stringify(this.restrictions) === JSON.stringify(other.restrictions);
    return restrictionsEq;
  }

  get constraints() {
    return this.restrictions;
  }

  static parseRestriction(spec) {
    const hasInclusiveLower = spec.startsWith("[");
    const hasInclusiveUpper = spec.endsWith("]");
    const process = spec.slice(1, -1).trim();
    const index = process.indexOf(",");

    if (index < 0) {
      if (!hasInclusiveLower || !hasInclusiveUpper) {
        throw new Error(`Single version must be surrounded by []: ${spec}`);
      }
      const version = new Version(process);
      return new Restriction(
        version,
        hasInclusiveLower,
        version,
        hasInclusiveUpper
      );
    } else {
      const lowerBound = process.slice(0, index).trim();
      const upperBound = process.slice(index + 1).trim();

      if (lowerBound === "" && upperBound === "") {
        return Restriction.allVersions();
      }
      if (lowerBound === upperBound) {
        throw new Error(`Range cannot have identical boundaries: ${spec}`);
      }
      const lowerVersion = new Version(
        lowerBound.length > 0 ? lowerBound : null
      );
      const upperVersion = new Version(
        upperBound.length > 0 ? upperBound : null
      );
      return new Restriction(
        lowerVersion,
        hasInclusiveLower,
        upperVersion,
        hasInclusiveUpper
      );
    }
  }

  static createFromSpec(spec) {
    const restrictions = [];
    let process = spec.trim();
    let version = null;

    if (!process.startsWith("(") && !process.startsWith("[")) {
      throw new Error("Recommended Version is currently not supported.");
    }

    while (process.startsWith("[") || process.startsWith("(")) {
      const index1 = process.indexOf(")");
      const index2 = process.indexOf("]");
      const index =
        index2 < 0 || (index1 >= 0 && index1 < index2) ? index1 : index2;

      if (index < 0) {
        throw new Error(`Unbounded range: ${spec}`);
      }

      const restriction = UnifiedVersionRange.parseRestriction(
        process.slice(0, index + 1)
      );
      restrictions.push(restriction);
      process = process.slice(index + 1).trim();

      if (process.length > 0 && process.startsWith(",")) {
        process = process.slice(1).trim();
      }
    }

    if (process.length > 0) {
      if (restrictions.length > 0) {
        throw new Error(
          `Only fully-qualified sets allowed in multiple set scenario: ${spec}`
        );
      } else {
        version = new Version(process);
        restrictions.push(Restriction.allVersions());
      }
    }

    return new UnifiedVersionRange(version, restrictions);
  }
}

module.exports = {
  Bound,
  Version,
  Restriction,
  UnifiedVersionRange,
};

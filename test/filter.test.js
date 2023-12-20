const { filterVersions } = require("../src/index.js");

const N = 20;
const VERSIONS = Array.from({ length: N + 1 }, (_, i) => `${i}`);

function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function versions() {
  return generateRandomInt(0, N);
}

function lefts() {
  const leftOptions = ["[", "("];
  return leftOptions[generateRandomInt(0, 1)];
}

function rights() {
  const rightOptions = ["]", ")"];
  return rightOptions[generateRandomInt(0, 1)];
}

function check(result, left, v1 = "", v2 = "", right = null) {
  if (v1 === "") {
    v1 = Number.NEGATIVE_INFINITY;
  }
  if (v2 === "") {
    v2 = Number.POSITIVE_INFINITY;
  }
  const maxVersionBeforeRange = left === "(" ? v1 : v1 - 1;
  const minVersionAfterRange = right === ")" ? v2 : v2 + 1;
  for (const version of result) {
    const num = parseInt(version, 10);
    expect(num <= maxVersionBeforeRange || minVersionAfterRange <= num).toBe(
      true
    );
  }
}

describe("Unified Range Tests", () => {
  test("Single version range", () => {
    const v = versions();
    const ranges = [`[${v}]`];
    const result = filterVersions(VERSIONS, ranges, false);
    expect(result).not.toContain(v.toString());
  });

  test("Unbound Lower Version", () => {
    const left = lefts();
    const v = versions();
    const right = rights();
    const ranges = [`${left},${v}${right}`];
    const result = filterVersions(VERSIONS, ranges, false);
    check(result, left, "", v, right);
  });

  test("Unbound Upper Version", () => {
    const left = lefts();
    const v = versions();
    const right = rights();
    const ranges = [`${left}${v},${right}`];
    const result = filterVersions(VERSIONS, ranges, false);
    check(result, left, v, "", right);
  });

  test("2 Param Range", () => {
    const left = lefts();
    const v1 = versions();
    const v2 = versions();
    const right = rights();

    const ranges = [`${left}${v1},${v2}${right}`];
    const result = filterVersions(VERSIONS, ranges, false);
    check(result, left, v1, v2, right);
  });

  test("Two 2 Param Range", () => {
    const left1 = lefts();
    const v11 = 4;
    const v12 = 6;
    const right1 = rights();
    const left2 = lefts();
    const v21 = 5;
    const v22 = 11;
    const right2 = rights();

    expect(v11).toBeLessThan(v12);
    expect(v21).toBeLessThan(v22);

    const ranges = [
      `${left1}${v11},${v12}${right1}`,
      `${left2}${v21},${v22}${right2}`,
    ];
    const result = filterVersions(VERSIONS, ranges, false);

    check(result, left1, v11, v12, right1);
    check(result, left2, v21, v22, right2);
  });

  test("Many Ranges", () => {
    const left1 = lefts();
    const v11 = 4;
    const v12 = 6;
    const right1 = rights();
    const left2 = lefts();
    const v21 = 5;
    const v22 = 11;
    const right2 = rights();

    expect(v11).toBeLessThan(v12);
    expect(v21).toBeLessThan(v22);

    const ranges = [
      `${left1}${v11},${v12}${right1}`,
      `${left2}${v21},${v22}${right2}`,
    ];
    const result = filterVersions(VERSIONS, ranges, false);

    check(result, left1, v11, v12, right1);
    check(result, left2, v21, v22, right2);
  });

  /* TODO: Still need to translate these tests:
@given(data())
@settings(suppress_health_check=(HealthCheck.filter_too_much,))
def test_many_ranges(data):
    # number of version ranges to use
    n_ranges = data.draw(integers(min_value=0, max_value=N + 1))
    rng_tuples = [data.draw(range_tuples()) for _ in range(n_ranges)]
    ranges = [range_tuple_to_str(rng) for rng in rng_tuples]
    note(ranges)
    result = api.filter_versions(VERSIONS, ranges)
    for rng in rng_tuples:
        _check(result, *rng)


@given(data=data(),
       current_version=versions())
@settings(suppress_health_check=(HealthCheck.filter_too_much,))
def test_next_filtered_version(data, current_version):
    n_ranges = data.draw(integers(min_value=0, max_value=N + 1))
    rng_tuples = [data.draw(range_tuples()) for _ in range(n_ranges)]
    ranges = [range_tuple_to_str(rng) for rng in rng_tuples]
    note(ranges)
    result = api.next_filtered_version(current_version=str(current_version),
                                       asc_versions=VERSIONS,
                                       ranges=ranges)
    if result is None:
        filtered_versions = api.filter_versions(asc_versions=VERSIONS,
                                                ranges=ranges)
        no_versions = filtered_versions == []
        # -1 is smaller than any version in VERSIONS, this is just for the code
        # not to explode in case no filtered versions were returned. In that
        # case, the `current_version_greater_than_filtered` case is irrelevant.
        max_version = filtered_versions[-1] if filtered_versions else -1
        version_too_big = int(max_version) < current_version
        assert no_versions or version_too_big
    else:
        assert int(result) >= int(current_version)


@given(data=data())
@settings(suppress_health_check=(HealthCheck.filter_too_much,))
def test_maximum_filtered_version(data):
    n_ranges = data.draw(integers(min_value=0, max_value=N + 1))
    rng_tuples = [data.draw(range_tuples()) for _ in range(n_ranges)]
    ranges = [range_tuple_to_str(rng) for rng in rng_tuples]
    note(ranges)
    result = api.maximum_filtered_version(asc_versions=VERSIONS,
                                          ranges=ranges)

    filtered_versions = api.filter_versions(asc_versions=VERSIONS,
                                            ranges=ranges)
    if result is None:
        assert not filtered_versions
    else:
        assert result == filtered_versions[-1]
        */
});

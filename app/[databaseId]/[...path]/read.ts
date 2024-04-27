import {
  O,
  getSubsetFromObject,
  hasAllLetters,
  objectMapSync,
  removeOptionalKeysFromObjectStrings,
} from "from-anywhere";
import {
  getUpstashRedisDatabase,
  upstashRedisGetRange,
} from "@/lib/upstashRedis";
import { Endpoint } from "@/client";
import { Filter, Sort } from "@/openapi-types";

const sortData = (sort: Sort[] | undefined, data: { [key: string]: O }) => {
  if (!sort?.length) {
    return data;
  }

  const result = sort.reduce((sortedData, datasetSort) => {
    const sortedKeys: string[] = Object.keys(sortedData).sort((a, b) => {
      const itemA = sortedData[a];
      const itemB = sortedData[b];
      const valueA = itemA[datasetSort.objectParameterKey];
      const valueB = itemB[datasetSort.objectParameterKey];
      const directionMultiplier =
        datasetSort.sortDirection === "ascending" ? 1 : -1;

      if (typeof valueA === "number" && typeof valueB === "number") {
        // Number sorg
        return (valueA - valueB) * directionMultiplier;
      }

      // String sort
      return String(valueA) < String(valueB)
        ? directionMultiplier * 1
        : directionMultiplier * -1;
    });

    const newSortedData = sortedKeys.reduce((data, key) => {
      return { ...data, [key]: sortedData };
    }, {} as { [key: string]: O });

    return newSortedData;
  }, data);

  return result;
};
const filterData = (
  filter: Filter[] | undefined,
  data: { [key: string]: O },
) => {
  if (!filter?.length) {
    return data;
  }

  const result = filter.reduce((filteredData, datasetFilter) => {
    const keys = Object.keys(filteredData).filter((key) => {
      const item = filteredData[key];

      const objectParameterKey =
        datasetFilter.objectParameterKey as keyof typeof item;

      const value = item[objectParameterKey];

      if (datasetFilter.operator === "equal") {
        return String(value) === datasetFilter.value;
      }

      if (datasetFilter.operator === "notEqual") {
        return String(value) === datasetFilter.value;
      }

      if (datasetFilter.operator === "isFalsy") {
        return !value;
      }

      if (datasetFilter.operator === "isTruthy") {
        return !!value;
      }

      const lowercaseValue = String(value).toLowerCase();
      const lowercaseDatasetValue = String(datasetFilter.value).toLowerCase();

      if (datasetFilter.operator === "endsWith") {
        return lowercaseValue.endsWith(lowercaseDatasetValue);
      }

      if (datasetFilter.operator === "startsWith") {
        return lowercaseValue.startsWith(lowercaseDatasetValue);
      }

      if (datasetFilter.operator === "includes") {
        return lowercaseValue.includes(lowercaseDatasetValue);
      }

      if (datasetFilter.operator === "includesLetters") {
        return hasAllLetters(lowercaseValue, lowercaseDatasetValue);
      }

      if (
        datasetFilter.operator === "greaterThan" &&
        datasetFilter.value !== null &&
        datasetFilter.value !== undefined
      ) {
        return Number(value) > Number(datasetFilter.value);
      }

      if (
        datasetFilter.operator === "lessThan" &&
        datasetFilter.value !== null &&
        datasetFilter.value !== undefined
      ) {
        return Number(value) < Number(datasetFilter.value);
      }

      if (
        datasetFilter.operator === "greaterThanOrEqual" &&
        datasetFilter.value !== null &&
        datasetFilter.value !== undefined
      ) {
        return Number(value) >= Number(datasetFilter.value);
      }

      if (
        datasetFilter.operator === "lessThanOrEqual" &&
        datasetFilter.value !== null &&
        datasetFilter.value !== undefined
      ) {
        return Number(value) <= Number(datasetFilter.value);
      }

      if (datasetFilter.operator === "isIncludedIn") {
        return lowercaseDatasetValue.split(",").includes(lowercaseValue);
      }

      return false;
    });

    const newFilteredData: { [key: string]: O } = getSubsetFromObject(
      filteredData,
      keys,
    );

    return newFilteredData;
  }, data);

  return result;
};
const searchData = (search: string | undefined, data: { [key: string]: O }) => {
  if (!search || search.length === 0) {
    return data;
  }

  const keys = Object.keys(data).filter((key) => {
    const item = data[key];

    const searchable = Object.values(item)
      .map((value) => JSON.stringify(value))
      .join(",")
      .toLowerCase();

    return searchable.includes(search.toLowerCase());
  });

  return getSubsetFromObject(data, keys);
};

export type ModelKey = string;

export const read: Endpoint<"read"> = async (context) => {
  const {
    databaseId,
    rowIds,
    search,
    startFromIndex,
    maxRows,
    filter,
    sort,
    objectParameterKeys,
    ignoreObjectParameterKeys,
  } = context;

  const upstashEmail = context["X-UPSTASH-API-KEY"];
  const upstashApiKey = context["X-UPSTASH-EMAIL"];

  if (!upstashApiKey || !upstashEmail) {
    return {
      isSuccessful: false,
      message: "Please provide your upstash details environment variables",
      databaseId,
    };
  }

  // step 2: validate authToken and find db name.
  const db = await getUpstashRedisDatabase({
    upstashEmail,
    upstashApiKey,
    databaseId,
  });

  if (!db) {
    return {
      isSuccessful: false,
      message: "Could not find db",
      databaseId,
    };
  }

  const result = await upstashRedisGetRange({
    redisRestToken: db.rest_token,
    redisRestUrl: db.endpoint,
    baseKey: undefined,
  });

  if (!result) {
    return { isSuccessful: false, message: "No result", databaseId };
  }

  // TODO: make this more efficient
  const specificResult = rowIds ? getSubsetFromObject(result, rowIds) : result;

  const searchedData = searchData(search, specificResult);

  // NB: filter the sliced data, if needed
  const filteredData = filterData(filter, searchedData);

  // NB: sort the filtered data, if needed

  const sortedData = sortData(sort, filteredData);

  const subsetData = objectParameterKeys?.length
    ? objectMapSync(sortedData, (key, value) =>
        getSubsetFromObject(
          value,
          objectParameterKeys! as readonly (keyof O)[],
        ),
      )
    : sortedData;

  const ignoredData = ignoreObjectParameterKeys?.length
    ? objectMapSync(subsetData, (key, item) => {
        return removeOptionalKeysFromObjectStrings(
          item as { [key: string]: any },
          ignoreObjectParameterKeys!,
        );
      })
    : subsetData;

  // NB: slice the data, if needed
  const slicedStartData = startFromIndex
    ? getSubsetFromObject(
        ignoredData,
        Object.keys(ignoredData).slice(startFromIndex),
      )
    : ignoredData;

  const slicedLimitData = maxRows
    ? getSubsetFromObject(
        slicedStartData,
        Object.keys(slicedStartData).slice(0, maxRows),
      )
    : slicedStartData;

  const hasMore = slicedLimitData.length < slicedStartData.length;

  const finalData = slicedLimitData;

  return {
    isSuccessful: true,
    message: "Found json and schema",
    hasMore,
    databaseId,
    items: finalData,
    // $schema,
    // schema,
  };
};

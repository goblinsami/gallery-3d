const INDEX_SEGMENT_REGEX = /^\d+$/;

export const deepClone = <T>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const pathToSegments = (path: string): string[] =>
  path
    .split(".")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

export const getValueAtPath = (target: unknown, path: string): unknown => {
  if (!target || typeof target !== "object") {
    return undefined;
  }

  const segments = pathToSegments(path);
  let cursor: unknown = target;

  for (const segment of segments) {
    if (cursor === null || cursor === undefined) {
      return undefined;
    }

    if (Array.isArray(cursor) && INDEX_SEGMENT_REGEX.test(segment)) {
      cursor = cursor[Number(segment)];
      continue;
    }

    if (typeof cursor !== "object") {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[segment];
  }

  return cursor;
};

export const setValueAtPath = (target: Record<string, unknown>, path: string, value: unknown): void => {
  const segments = pathToSegments(path);
  if (segments.length === 0) {
    return;
  }

  let cursor: unknown = target;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];
    const shouldCreateArray = INDEX_SEGMENT_REGEX.test(nextSegment);

    if (Array.isArray(cursor) && INDEX_SEGMENT_REGEX.test(segment)) {
      const numericIndex = Number(segment);
      if (cursor[numericIndex] === undefined || cursor[numericIndex] === null) {
        cursor[numericIndex] = shouldCreateArray ? [] : {};
      }
      cursor = cursor[numericIndex];
      continue;
    }

    if (typeof cursor !== "object" || cursor === null) {
      return;
    }

    const record = cursor as Record<string, unknown>;
    if (record[segment] === undefined || record[segment] === null) {
      record[segment] = shouldCreateArray ? [] : {};
    }
    cursor = record[segment];
  }

  const finalSegment = segments[segments.length - 1];
  if (Array.isArray(cursor) && INDEX_SEGMENT_REGEX.test(finalSegment)) {
    cursor[Number(finalSegment)] = value;
    return;
  }

  if (typeof cursor !== "object" || cursor === null) {
    return;
  }

  (cursor as Record<string, unknown>)[finalSegment] = value;
};


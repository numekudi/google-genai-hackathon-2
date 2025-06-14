export function serializeServerData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

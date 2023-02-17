import type { QueryStrings } from '$/model/QueryStrings';

const has = (name: QueryStrings) => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.has(name);
};
const get = (name: QueryStrings, parse?: (value) => any) => {
  const searchParams = new URLSearchParams(location.search);
  const value = searchParams.get(name);
  if (parse && value) return parse(value);
  return value;
};
const getAll = (name: QueryStrings) => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.getAll(name);
};
const set = (name: QueryStrings, value: string) => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.set(name, value);
};
const append = (name: QueryStrings, value: string) => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.append(name, value);
};
const _delete = (name: QueryStrings) => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.delete(name);
};
const sort = () => {
  const searchParams = new URLSearchParams(location.search);
  return searchParams.sort();
};

export { append, get, set, has, getAll, _delete as delete, sort };

// "/api/orguser/:orgId/1/:pid" 替换为/api/orguser/2/1/5, params: {orgId:2, pid:5}
export const matchUrl = (url,params) => {
  return url.replace(/\:(\w+)/g, (match,key) => {
    return  params?.[key]
  })
}
export const isArray = (obj) => Array.isArray(obj);
export const isEmpty = (obj) =>
  [Object, Array].includes((obj || {}).constructor) &&
  !Object.entries(obj || {}).length;
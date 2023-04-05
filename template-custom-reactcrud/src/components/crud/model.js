import request from "@/utils/request"; 
import {matchUrl, isArray} from "@/utils/tools";
/**
 * 
 * @namespace {string}  与store/index.js  init 注册的一致 
 * @state {object}
 * @fetchurl {string} 获取数据的url
 * @url {string} url  '/api/role'
 * @effects {function} 
 * @reducers {function}
 * @returns 
 */
export const rootModel = ({
  namespace, 
  state,
  url,
  addurl = "",
  fetchurl = "",
  _effects = () => {},
  _reducers,
}) => {
 return {
  namespace,
  state: {
    // 有子表需要展示时，需要CrudTable中params加入curListId 参数,可以看operation/warning/childTable用法
    // [curListId]: {
    //   list: [],
    //   pagination: {},
    //   editItem: {},
    //   filter: {},
    // }
    // 列表
    list: [],
    pagination: {},
    editItem: {},
    filter: {},
    ...state,
  },
  effects: (dispatch) => ({
    // 取数据
    async fetchList({payload}) {
      const curListId = payload?.params?.curListId
      const {success,data} = await request.get(matchUrl(fetchurl || url , payload?.params), {...payload?.pagparams, ...payload?.params});
      if (success) {
        if (data?.pagination) {
          const {pageNum,pageSize,totalSize} = data?.pagination
          const listItem = {
            list: data?.data,
            pagination: { current: pageNum, pageSize, total:totalSize  },
            filter: payload
          }
          if (curListId) {
            await dispatch[namespace].save({
              [curListId] : listItem
            });
          } else {
            await dispatch[namespace].save(listItem);
          }
        } else {
          const listItem = {
            list: isArray(data)
              ? data
              : data 
                ? [data]
                : [],
            pagination: {},
            filter: payload
          }
          if (curListId) {
            await dispatch[namespace].save({
              [curListId] : listItem
            });
          } else {
            await dispatch[namespace].save(listItem);
          }
        }
      }
    },
    // 获取编辑中数据，不用请求接口
    async fetchByIdNoApi(payload, rootState) {
      const curListId = payload?.params?.curListId
      const { id } = payload;
      const stateItem = curListId? rootState[namespace][curListId]: rootState[namespace];
      const editItem = stateItem?.list.find((item) => item.id == id);
      if (curListId) { 
        dispatch[namespace].save({
          [curListId]:  {
            ...stateItem,
            editItem
          }
        })
      } else {
        dispatch[namespace].save({editItem})
      }
    },
    async fetchById(payload, rootState) {
      const curListId = payload?.params?.curListId
      const { id } = payload;
      
      const purl = matchUrl(url, payload?.params)
      const {success,data: editItem} = await request.get(`${purl}/${id}`);
      if (success) {
        if (curListId) {
          dispatch[namespace].save({
            [curListId]:  {
              ...rootState[namespace][curListId],
              editItem
            }
          })
        } else {
          dispatch[namespace].save({editItem})
        }
      }
    },
    // 添加数据
    async add({ payload, callback }, rootState) {
      const curListId = payload?.params?.curListId
      const { filter } = curListId ? rootState[namespace][curListId]: rootState[namespace];
      const {success} = await request.post(matchUrl(addurl || url, payload?.params) , payload.values);
      if (success) {
        await dispatch[namespace].fetchList({
          payload: {...filter,pageNum: 1},
        })
        if (callback) callback();
      }
    },
    // 更新数据
    async update({ payload, callback }, rootState) {
      const curListId = payload?.params?.curListId
      const {id} = payload
      const purl = matchUrl(url, payload?.params)
      const { filter } = curListId ? rootState[namespace][curListId]: rootState[namespace];
      const {success} = await request.put(`${purl}/${id}`, payload.values);
      if (success) {
        await dispatch[namespace].fetchList({
          payload: {...filter},
        })
        if (callback) callback();
      }
    },
    // 删除数据
    async delete({ payload, callback }, rootState) {
      const curListId = payload?.params?.curListId
      const purl = matchUrl(url, payload?.params)
      const {id} = payload
      const { filter } = curListId ? rootState[namespace][curListId]: rootState[namespace];
      const {success} = await request.delete(`${purl}/${id}`);
      if (success) {
        await dispatch[namespace].fetchList({
          payload: {...filter},
        })
        if (callback) callback();
      }
    },
    ..._effects(dispatch),
  }),

  reducers: {
    save(state, payload) {
      return { ...state, ...payload };
    },
    clear(state) {
      return {
        ...state,
        list: [],
        pagination: {},
        editItem: {},
        filter: {}
      };
    },
    ..._reducers,
  },
 }
};

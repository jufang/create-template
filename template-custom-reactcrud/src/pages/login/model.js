import axios from "axios";
import request from "@/utils/request"; 
import { userInfo ,auth, token} from "@/utils/storage";

export default {
  state: {
  },
  reducers: {
    save(state, payload) {
      return { ...state, ...payload };
    },
  },
  effects: (dispatch) => ({
    async login({ payload ,callback}) {
      const {success,data} = await request.post('/api/login', payload);
      if (success) {
        userInfo.save({username: data?.userName, isSuper: data?.isSuperuser});
        token.save(data.token)
        await dispatch.login.fetchUserPermission(data?.token)
        callback()
      }
    },
    async fetchUserPermission(token) {
      await axios({
        method: 'get',
        url: `/api/permission`,
        headers: {
          'Authorization': token
        }
      })
        .then(({status, data}) => {
          if(status === 200 && data?.success) {
            auth.save(data?.data)
          }
        });
    },
    async logout({callback}) {
      localStorage.clear();
      callback && callback()
    },
    async changePassword({ payload ,callback}) {
      const {success,data} = await request.put('/api/updatepassword', payload);
      if (success) {
        localStorage.clear();
        callback && callback()
      }
    }
  }),
};

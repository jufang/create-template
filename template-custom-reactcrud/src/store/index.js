/** 全局唯一数据中心 **/
import { init } from "@rematch/core";
import loadingPlugin from "@rematch/loading";
import systemNotice from "@/pages/system/notice/model";
import login from '@/pages/login/model';


export default init({
  models: {
    systemNotice,
    login
  },
  plugins: [loadingPlugin()],
})

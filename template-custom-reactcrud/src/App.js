import { Suspense } from "react";
import { Provider } from "react-redux";
import { ConfigProvider, App } from "antd";
import zhCN from 'antd/locale/zh_CN';
// 后面router会有错误边界处理
import {ErrorBoundary, ErrorPage} from '@/components/error-boundary';
import { RouterProvider } from "react-router-dom";
import store from "./store";
import routerconfig from "./router";
import styles from '@/components/error-boundary/linearProgressbar.css';

const LinearProgressBar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.normal}>
        <div className={styles.highlight}></div>
      </div>
    </div>
  )
}

export default function RootContainer() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN} theme={{
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 2,
          fontSizeIcon: 20,
        },
      }}>
          <ErrorBoundary fallback={<ErrorPage />}>
            <Suspense fallback={<LinearProgressBar/>}>
              <RouterProvider router={routerconfig} />
            </Suspense>
          </ErrorBoundary>

      </ConfigProvider>
    </Provider>
  );
}

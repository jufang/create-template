import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import 'antd/dist/reset.css';
import './common.css';

const container = document.getElementById("app-root");
const root = createRoot(container);

// 开发环境在严格模式下有加载两次这种情况，生产环境没有这个问题
root.render(
  <App />
  // <StrictMode> <App /></StrictMode>
);
// if (module.hot) {
//   module.hot.accept();
// }

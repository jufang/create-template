import { lazy } from 'react';
export const Login = lazy(() => import(/* webpackChunkName: "login" */"@/pages/login"))
export const Home = lazy(() => import(/* webpackChunkName: "Home" */'@/pages/home'));
// 设置
export const SystemNotice = lazy(() => import(/* webpackChunkName: "SystemNotice" */'@/pages/system/notice'));

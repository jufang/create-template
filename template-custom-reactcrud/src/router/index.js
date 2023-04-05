import { createBrowserRouter } from "react-router-dom";
import BasicLayout from "@/components/layouts/BasicLayout";
import {RouterErrorBoundary} from '@/components/error-boundary'
import {SystemNotice , Login, Home} from './lazycmp'

const router =  createBrowserRouter([
  {
    path: "/",
    element: <BasicLayout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: 'home',
        element: <Home/>
      },
      {
        path: "system/notice",
        element: <SystemNotice />,
      },
      {
        path: "*",
        element: <Home />,
      }
    ]
  },
  {
    path: "/login",
    element: <Login />,
  },
  
])

export default router
import { useRouteError } from "react-router-dom"
import { ErrorPage } from "./ErrorPage";

const RouterErrorBoundary = () => {
  let error = useRouteError();
  return <ErrorPage/>
}

export default RouterErrorBoundary
import styles from "./index.css";
export const ErrorPage = () => {
  return (
    <div className={styles.errorpage}>
      <h3>页面出错了 🚨</h3>
      <p>请联系管理员修改</p>
    </div>
  );
};
import styles from  "./index.css";
import Form from "./form";

const UserLayout = () => {
  return (
    <div className={styles.bg}>
      <div className={styles.main}>
        <div className={styles.top}>
          {/* <img alt="logo" className="logo" src={logo} /> */}
          <span className={styles.title}>中台页面控制系统</span>
        </div>
        <Form />
      </div>
    </div>
  );
};
export default UserLayout;
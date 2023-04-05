import {  Layout, Menu, theme } from "antd";
import {  Outlet, useNavigation,useLocation } from "react-router-dom";
import { siderConfig } from './siderMenuConfig';
import styles from "./index.css";

const { Header, Content, Sider } = Layout;

const mainItems = ["1", "2", "3"].map((key) => ({
  key,
  label: `导航 ${key}`,
}));

// 根据权限控制菜单展示
const items = siderConfig()

const BasicLayout = () => {
  // const SelectedKeys = useMemo(() => pathname ? [pathname] : ['/system'], [pathname])
  const {pathname} = useLocation()
  
  const navigation = useNavigation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout
    style={{
      minHeight: '100vh',
    }}
      >
      <Header className={styles.header}>
        <div className={styles.logo} />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={mainItems}
        />
      </Header>
      <Layout>
        <Sider
          collapsible
          breakpoint="lg" 
          width={200}
          theme='light'
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["notice"]}
            defaultOpenKeys={["system"]}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={items}
          />
        </Sider>
        <Content
          style={{
            padding: 24,
            marginLeft: '1px',
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          <div className={navigation.state === "loading" ? styles.loading : ""}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default BasicLayout;

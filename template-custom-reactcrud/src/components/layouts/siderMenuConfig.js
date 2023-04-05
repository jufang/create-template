import Icon, { SettingOutlined, CompassOutlined } from "@ant-design/icons";
import {  NavLink} from "react-router-dom";
import notice from "@/assets/icons/notice.svg";
import { auth, userInfo } from "@/utils/storage";

// 配置所有的系统设置菜单
const systemData = [
  {
    to: "/system/notice",
    src: notice,
    name: "系统通知",
    auth: ["notification:manage"],
  },
];
// 配置所有的运维管理菜单
const operationData = [
  {
    to: "/operation/notice",
    src: notice,
    name: "系统通知2",
    auth: ["notification:manage"],
  },
];
// 子菜单设置icon, 加上跳转
const transMenuData = (data) => {
  return data.map((item) => {
    return {
      icon: <Icon className="sider-menu-icon" component={item.src} />,
      label: (
        <NavLink to={item.to} key={item.to}>
          {item.name}
        </NavLink>
      ),
      key: `${item.to}`,
    };
  });
};
// 根据权限生成菜单
const menuGroup = ({data, ...rest}) => {
  if (data.length) {
    return {
      ...rest,
      children: transMenuData(data)
    }
  } else {
    return null
  }
}

export const siderConfig = () => {
  const storageAuth = auth.get() || [];
  const { isSuper } = userInfo.get() || 0;

  // 只有超级管理员才有用户管理，角色管理，数据权限的权限，普通用户操作权限通过角色管理中分配权限指定
  const systemMenuByAuth = systemData.filter((item) => {
    if (item.needSuperuser) {
      return isSuper && storageAuth.some((v) => item.auth.includes(v.code));
    } else {
      return storageAuth.some((v) => item.auth.includes(v.code));
    }
  });
  const operationMenuByAuth = operationData.filter((item) =>
    storageAuth.some((v) => item.auth.includes(v.code))
  );
  return [
    menuGroup({
      data: systemMenuByAuth,
      key: "system",
      icon: <CompassOutlined />,
      label: "系统设置",
    }),
    menuGroup({
      data: operationMenuByAuth,
      key: "operation",
      icon: <SettingOutlined />,
      label: "运维管理",
    }),
  ];
};

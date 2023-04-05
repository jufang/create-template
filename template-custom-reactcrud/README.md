# react-crud-nut
## 目录结构
```
|-react-crud-nut
  |-.babelrc
  |-.gitignore
  |-README.md
  |-dist
  |-hooks
  |-jsconfig.json
  |-package.json
  |-pnpm-lock.yaml
  |-public
  |  |-index.html
  |-src
  |  |-App.js
  |  |-assets
  |  |-common.css
  |  |-components
  |  |  |-RenderModal // 封装model组件
  |  |  |-crud     // 封装crud组件
  |  |  |  |-RenderForm.js
  |  |  |  |-index.css
  |  |  |  |-index.js
  |  |  |  |-model.js // 基于rematch封装model,
  |  |  |  |-uploadForm.js // 封装上传组件
  |  |  |-error-boundary // 错误边界模块
  |  |  |-layouts
  |  |  |  |-BasicLayout.js
  |  |  |  |-index.css
  |  |  |  |-siderMenuConfig.js
  |  |-index.js
  |  |-pages
  |  |  |-home
  |  |  |  |-index.js
  |  |  |-login  // 一个登录完整模块
  |  |  |-system // 使用封装crud组件完成notice模块
  |  |  |  |-notice
  |  |  |  |  |-components
  |  |  |  |  |  |-Form.js
  |  |  |  |  |-index.js
  |  |  |  |  |-model.js
  |  |-router  
  |  |  |-index.js
  |  |  |-lazycmp.js // 懒加载组件
  |  |-store         // 定义全局store
  |  |  |-index.js
  |  |-utils
  |  |  |-request.js // 封装http请求
  |  |  |-storage.js
  |  |  |-tools.js
  |-webpack.config.js
```
# api 请求格式，
这个需要跟后端沟通，目前采用restful格式请求

* list请求
`get`  `/api/notification`  
* 新增
`post` `api/notification`
* 获取表单item
如果是走api中获取 `get`  `/api/notification/${id}` 
如果不走api，从list中获取点击对象 list中的某一个item
* 更新
`PUT`  `/api/notification/${id}` 
* 删除
`DELETE`  `/api/notification/${id}` 

# 如何配置一个model
具体看`src/components/crud/model`
```
rootModal({
  namespace, // 在store/index.js中通过init配置的，必填
  fetchurl, // 如果获取list url 跟url不一样，
  url:'/api/:riskType/:id/:childRiskType',,     // 请求url,带参数写法
  addurl // 单独配置新增url
  state, // 新定义的state
  _effects: (dispatch) => ({}) // 跟rematch 中的effect 写法一样，主要做复用
  _reducers //  纯函数
})
```
调用方式
```js
import {rootModel} from '@/components/crud/model';

export default rootModel({
  namespace: 'systemNotice', 
  url:'/api/notification',
})

```
# 页面crud
```js
const Notice = () => {
  return (
    <CrudWrapper namespace="systemNotice" columns={columns}>
      <CrudAdd>
        <ModalForm/>
      </CrudAdd>
    </CrudWrapper>
  );
};

```
![页面list](https://github.com/jufang/react-crud-nut/blob/main/docs/img/readme1.jpg)
![新增](https://github.com/jufang/react-crud-nut/blob/main/docs/img/readme2.jpg)


![编辑](https://github.com/jufang/react-crud-nut/blob/main/docs/img/readme3.jpg)
调用方式
```js
<CrudUpdate record={record} fetchByApi={false}>
          <ModalForm/>
        </CrudUpdate>
```
![删除](https://github.com/jufang/react-crud-nut/blob/main/docs/img/readme4.jpg)
调用方式
```js
<CrudDel record={record} />
```
import  {
  memo,
  cloneElement,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  Form,
  Table,
  Button,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { connect } from "react-redux";
import RenderPropsModal from "@/components/Rendermodal";

import { isEmpty } from "@/utils/tools";
import styles from "./index.css";
import UploadForm from "./uploadForm";

const mapStateToProps = (state, ownProps) => {
  const { namespace, params } = ownProps;
  const curListId = params?.curListId;
  const vals = curListId ? state[namespace][curListId] : state[namespace];
  if (vals) {
    return {
      ...vals,
      loading: state.loading.effects[namespace],
    };
  } else {
    return {
      list: [],
      pagination: {},
      editItem: {},
      filter: {},
      loading: state.loading.effects[namespace],
    };
  }
};
const AddUpdateContext = createContext();

export const CrudWrapper = connect(mapStateToProps)((props) => {
  const {
    namespace,
    dispatch,
    loading: {
      fetchList: fetchloading,
      add: addloading,
      update: updateloading,
    },
    expandable = {}, // 嵌套子表格
    rowSelection = null, // 表格行是否可选择
    list,
    showPage = true,
    pagination,
    children,
    editItem,
    params = null, // 外部index.js传入的参数，比如传orgId
    filter,
    columns,
    // 请求${namespace}/fetchList的条件，默认不传fetchListCondition，是直接请求的
    fetchListCondition = props.fetchListCondition === undefined ? true : false,
    // 只有一览的样式，cardStyle是两栏
  } = props;
  const addUpdateLoading = addloading || updateloading;
  // 列表参数 (后端不接受pageSize参数，这个属性去掉)
  pagination.showSizeChanger = false;

  const [pagparams, setParams] = useState({
    pageNum: pagination.current || 1,
    pageSize: pagination.pageSize || 10,
  });
  // 【初始化后，加载左侧角色树数据】
  useEffect(() => {
    if (fetchListCondition) {
      dispatch[namespace].fetchList({
        payload: {
          params,
          pagparams,
          // ...pagparams
        },
      });
    }
    return () => {
      if (!params?.curListId) {
        dispatch[namespace].clear();
      }
    };
  }, [namespace, fetchListCondition, params, pagparams]);

  const handleTableChange = useCallback(
    (page) => {
      const { current, pageSize } = page;
      setParams({
        ...pagparams,
        pageNum: current,
        pageSize,
      });
    },
    [pagparams]
  );

  return (
    <AddUpdateContext.Provider
      value={{
        params,
        namespace,
        dispatch,
        editItem,
        loading: addUpdateLoading,
      }}
    >
      <div className={styles.tableListOperator}>{children}</div>
      {fetchListCondition ? (
        <Table
          rowKey="id"
          rowSelection={rowSelection}
          loading={fetchloading}
          columns={columns}
          expandable={expandable}
          dataSource={list}
          pagination={showPage && pagination}
          size="small"
          onChange={handleTableChange}
        />
      ) : (
        <Table rowKey="id" columns={columns} size="small" />
      )}
    </AddUpdateContext.Provider>
  );
});

const FormWrapper = ({ children, closemodal, id, fetchByApi, isEdit }) => {
  const { namespace, editItem, params, dispatch, loading } =
    useContext(AddUpdateContext);
  const [form] = Form.useForm();
  const { resetFields, setFieldsValue } = form;
  const [messageApi, contextHolder] = message.useMessage();
  // 【修改时，获取角色表单数据】
  useEffect(() => {
    if (isEdit) {
      dispatch({
        type: fetchByApi
          ? `${namespace}/fetchById`
          : `${namespace}/fetchByIdNoApi`,
        payload: {
          params,
          id,
        },
      });
    }
  }, [isEdit, params, id, fetchByApi, namespace]);
  
  // 【修改时，回显角色表单】
  useEffect(() => {
    // 👍 将条件判断放置在 effect 中
    if (isEdit && !isEmpty(editItem)) {
      setFieldsValue(editItem);
    }
  }, [isEdit, editItem, setFieldsValue]);

  // 【添加与修改角色】
  const onSubmit = (values) => {
    if (isEdit) {
      dispatch[namespace].update({
        payload: {
          params,
          values,
          id,
        },
        callback: () => {
          resetFields();
          closemodal();
          messageApi.success("修改成功。");
        },
      });
    } else {
      dispatch[namespace].add({
        payload: { values, params },
        callback: () => {
          resetFields();
          closemodal();
          messageApi.success("添加成功。");
        },
      });
    }
  };

  return (
    <>
      {contextHolder}
      {cloneElement(children, {
        form,
        closemodal,
        loading,
        onSubmit,
      })}
    </>
  );
};

// 新增
export const CrudAdd = memo(
  ({ children, title = "新增", disabled = false, width = 520 }) => {
    return (
      <>
      <RenderPropsModal
        width={width}
        title={title}
        triggerBtn = {
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={disabled}
          >
            {title}
          </Button>
        }
      >
        <FormWrapper isEdit={false}>{children}</FormWrapper>
      </RenderPropsModal>
      </>
    );
  }
);

// 更新, 在FormWrapper组件中是否通过api取数据，默认通过${namespace}/fetchById获得回显数据
export const CrudUpdate = memo(
  ({
    children,
    title = "编辑",
    record,
    fetchByApi = true,
    width = 520,
  }) => {
    return (
      <RenderPropsModal
        title={title}
        width={width}
        triggerBtn= {
          <EditOutlined title="编辑" className="fz20" />
        }
      >
        <FormWrapper id={record.id} fetchByApi={fetchByApi} isEdit={true}>
          {children}
        </FormWrapper>
      </RenderPropsModal>
    );
  }
);
export const CrudDel = memo(({ record }) => {
  const { namespace, params, dispatch } = useContext(AddUpdateContext);
  const [messageApi, contextHolder] = message.useMessage();
  // 【删除】
  const handleDelete = useCallback(() => {
    dispatch[namespace].delete({
      payload: {
        params,
        id: record.id,
      },
      callback: () => {
        messageApi.success("删除成功。");
      },
    });
  }, [namespace, record, params]);
  return (
    <>
      {contextHolder}
      <Popconfirm
        title="您确定要删除这条记录吗？此操作将不可恢复，是否继续？"
        onConfirm={handleDelete}
        okText="确定"
        cancelText="取消"
      >
        <DeleteOutlined title="删除" className="icon fz20" />
      </Popconfirm>
    </>
  );
});

export const CrudUpload = memo(
  ({ title = "导入", namespace, pk, disabled = false }) => {
    return (
      <RenderPropsModal
        title={title}
        width={width}
        triggerBtn= {
          <Button
              icon={<UploadOutlined />}
              disabled={disabled}
              type="primary"
              onClick={showModalHandler}
            >
              {title}
            </Button>
        }
      >
        <UploadForm pk={pk} namespace={namespace} />
      </RenderPropsModal>
    );
  }
);
export default CrudWrapper;

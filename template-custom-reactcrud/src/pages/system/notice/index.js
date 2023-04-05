import { Tag, Divider } from 'antd';
import CrudWrapper, { CrudAdd, CrudDel ,CrudUpdate} from "@/components/crud";
import ModalForm from './components/Form';

const columns = [
  {
    title: '消息',
    dataIndex: 'message',
  },
  {
    title: '状态',
    dataIndex: 'state',
    align: 'center',
    render: (value) => {
      if (value) {
        return <Tag color="green">正常</Tag>;
      } else {
        return <Tag color="red">停用</Tag>;
      }
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    fixed: 'right',
    render: (text, record) => (
      <>
        <CrudUpdate record={record} fetchByApi={false}>
          <ModalForm/>
        </CrudUpdate>
        <Divider type="vertical" />
        <CrudDel record={record} />
      </>
    ),
  },
];
const Notice = () => {
  return (
    <CrudWrapper namespace="systemNotice" columns={columns}>
      <CrudAdd>
        <ModalForm/>
      </CrudAdd>
    </CrudWrapper>
  );
};


export default Notice;

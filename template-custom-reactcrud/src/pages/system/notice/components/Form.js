// 标段
import { useCallback } from 'react';
import { Form, Input, Switch} from 'antd';
import RenderForm from '@/components/crud/RenderForm';

const ModalForm = (props) => {
  const {onSubmit, ...restProps} = props
  
  const handleAddOrUpdate = useCallback((values) => {
    values.msg = values.message
    values.state = values.state ? 1 : 0;
    onSubmit(values)
  },[])
  return (
    <RenderForm {...restProps}
      initialValues={{
        state: 0,
      }}
      onFinish={handleAddOrUpdate}>
     <Form.Item
        label="消息"
        name="message"
        rules={[
          { required: true, message: '请输入系统通知消息' },
          { max: 255 },
        ]}
      >
        <Input.TextArea
          placeholder="请输入系统消息。"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>
      <Form.Item
        label="状态"
        name="state"
        rules={[{ required: true }]}
        valuePropName="checked"
      >
        <Switch checkedChildren="正常" unCheckedChildren="停用" />
      </Form.Item>
    </RenderForm>
  );
};

export default ModalForm;
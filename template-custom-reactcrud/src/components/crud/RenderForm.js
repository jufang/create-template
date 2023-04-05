import { memo } from 'react';
import { Button, Form, Space} from 'antd';


const RenderForm = ({children,form, loading,closemodal,onFinish, ...restProps }) => {
  // 设置label 宽度
  const labelColSpan = restProps.labelcolspan ? restProps.labelcolspan : 6
  const layout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: labelColSpan},
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 - labelColSpan },
    },
  };
  const tailLayout = {
    wrapperCol: {
      xs: { offset: 0, span: 24 },
      sm: { offset: labelColSpan, span: 24 - labelColSpan },
    },
  };
  return (
    <Form form={form}  {...layout} name="modelForm" className="form" onFinish={onFinish} {...restProps}>
      {children}
      <Form.Item {...tailLayout}>
        <Space>
          <Button onClick={closemodal}>取消</Button>
          <Button type="primary" loading={loading} htmlType="submit">
            确定
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
export default memo(RenderForm);
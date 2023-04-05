import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from 'antd';
import { connect } from 'react-redux';

const ChangePasswordForm = ({ submitting, closemodal, dispatch }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { resetFields } = form;
  // 【表单布局】
  const layout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  };
  const tailLayout = {
    wrapperCol: {
      xs: { offset: 0, span: 24 },
      sm: { offset: 5, span: 19 },
    },
  };
  // 【添加】
  const handleAdd = (values) => {
    dispatch.login.changePassword({
      payload: values,
      callback: () => {
        resetFields();
        closemodal();
        navigate("/login", { replace: true});
      },
    });
  };

  return (
    <Form {...layout} onFinish={handleAdd}>
      <Form.Item
        label="原密码"
        name="oldPassword"
        rules={[{ required: true, message: '请输入原密码' }]}
      >
        <Input type="password" />
      </Form.Item>
      <Form.Item
        label="新密码"
        name="newPassword"
        rules={[
          { required: true, message: '请输入新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (
                getFieldValue('password2') &&
                getFieldValue('password2') !== value
              ) {
                return Promise.reject(new Error('两次密码输入不一致'));
              } else {
                return Promise.resolve();
              }
            },
          }),
        ]}
      >
        <Input type="password" />
      </Form.Item>
      <Form.Item
        label="确认密码"
        name="password2"
        rules={[
          { required: true, message: '请确认新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次密码输入不一致'));
            },
          }),
        ]}
      >
        <Input type="password" />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button onClick={closemodal}>取消</Button>&nbsp;
        <Button type="primary" loading={submitting} htmlType="submit">
          确定
        </Button>
      </Form.Item>
    </Form>
  );
};

export default connect(({ loading }) => ({
  submitting: loading.effects.login.changePassword,
}))(ChangePasswordForm);

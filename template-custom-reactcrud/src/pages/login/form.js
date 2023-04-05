import { useState } from 'react';
import { useLocation, useNavigate} from "react-router-dom";
import { Form, Input, Button} from 'antd';
import { LockTwoTone, UserOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import styles from  "./index.css";

const FormItem = Form.Item;

const Login = (props) => {
  const location = useLocation();
  let navigate = useNavigate();
  const from = location.state?.from || "/home";
  const { submitting, dispatch } = props;
  const [img, setImg] = useState(Math.random());


  const handleSubmit = (values) => {
    dispatch.login.login({
      payload: { ...values },
      callback: () => {
        navigate(from || '/home', {replace: true});
      },
    })
  };

  return (
    <div className={styles.login}>
      <Form
        form={props.from}
        onFinish={(values) => {
          handleSubmit(values);
        }}
      >
        <FormItem
          name="username"
          rules={[{ required: true, message: '请输入用户名!' }]}
        >
          <Input
            size="large"
            placeholder="请输入用户名:"
            prefix={
              <UserOutlined
                style={{ color: '#1890ff' }}
                className={styles.prefixIcon}
              />
            }
          />
        </FormItem>
        <FormItem
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="密码"
            prefix={<LockTwoTone className={styles.prefixIcon}/>}
          />
        </FormItem>
       <FormItem
          name="code"
          rules={[
            {
              required: true,
              message: '请输入验证码！',
            },
          ]}
        >
          <Space align='center'>
             <Input
                size="large"
                placeholder="输入验证码"
                // prefix={<LockTwoTone className={styles.prefixIcon} />}
              />
             <Image
                preview={false}
                src={`http://10.3.20.255:8080/api/code/image?v=${img}`}
              />
             <Button
                type="link"
                onClick={() => {
                  setImg(Math.random())
                }}
              >
                刷新
              </Button>
         </Space>
       </FormItem>
        <FormItem>
          <Button
            className={styles.submit}
            size="large"
            type="primary"
            htmlType="submit"
            loading={submitting}
          >
            登录
          </Button>
        </FormItem>
      </Form>
      <div className={styles.copyright}>
        <a href="">京ICP备1dsad12311号-1</a>
      </div>
    </div>
  );
};

export default connect(({loading }) => ({
  submitting: loading.effects.login.login,
}))(Login);
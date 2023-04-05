import { useState } from "react";
import { Form,Button, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';

const tailLayout = {
  wrapperCol: {
    xs: { offset: 0, span: 24 },
    sm: { offset: 6, span: 18 },
  },
};

const layout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6},
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

const UploadForm =connect(({ loading })=> ({
  loading
}))
(
  ({dispatch, closemodal,loading, namespace, pk="", accept=".xlsx, .xls"}) => {
    const uploadloading = loading.effects[namespace].upload
    const [form] = Form.useForm();
    const [tempFile, setTempFile] = useState([]);
    
    const handleAddOrUpdate = (values) => {
      
      let formData = new FormData();
      formData.append('file', tempFile[0]);
      dispatch[namespace].upload({
        payload:{
          pk,
          formData
        },
        callback: () => {
          closemodal();
          message.success("导入成功。");
        },
      })
      closemodal()
    }
    const props = {
      onChange: (info) => {
        if (info.fileList.length > 0) {
          setTempFile([info.file]);
        }
      },
      onRemove: () => {
        setTempFile([]);
      },
      beforeUpload: (file) => {
        setTempFile([file]);
        return false;
      },
      fileList: tempFile,
    };
    
    return (
      <Form
        {...layout}
        form ={form}
        onFinish={handleAddOrUpdate}
      >
        <Form.Item name="file" label="上传" rules={[{ required: true }]}>
          <Upload accept={accept} {...props}>
            <Button icon={<UploadOutlined />}>点击选取文件</Button>
          </Upload>
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button onClick={closemodal}>取消</Button>
          <Button type="primary" loading={uploadloading} htmlType="submit" style={{marginLeft:10}}>
            确定
          </Button>
        </Form.Item>
      </Form>
    );
  }
)
 


export default UploadForm;

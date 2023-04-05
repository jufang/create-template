import { memo, useState, cloneElement } from "react";
import { Modal } from "antd";

const RenderPropsModal = memo(
  ({
    title,
    children,
    triggerBtn,
    disabled,
    ...restProps
  }) => {
    // 【模态框显示隐藏属性】
    const [visible, setVisible] = useState(false);
    // 【模态框显示隐藏函数】
    const showModalHandler = (e) => {
      if (e) e.stopPropagation();
      setVisible(true);
    };
    const hideModelHandler = (e) => {
      if (e) e.stopPropagation();
      // _handleOnCloseReload && _handleOnCloseReload()
      setVisible(false);
    };
    const getControlled = () => ({
      disabled,
      onClick: showModalHandler,
    });
    return (
      <>
        <Modal
          title={title}
          open={visible}
          onCancel={hideModelHandler}
          keyboard={false}
          zIndex={1002}
          destroyOnClose
          footer={null}
          {...restProps}
        >
            
          {cloneElement(children, {
            closemodal: hideModelHandler,
          })}
        </Modal>
        {cloneElement(triggerBtn, getControlled())}
      </>
    );
  }
);

export default RenderPropsModal;
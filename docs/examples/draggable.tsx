import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import Dialog from 'rc-dialog';
import '../../assets/index.less';

const MyControl = () => {
  const [visible, setVisible] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  const onClick = () => {
    setVisible(true);
  }

  const onClose = () => {
    setVisible(false);
  }

  return (
    <div style={{ margin: 20 }}>
      <p>
        <button type="button" className="btn btn-primary" onClick={onClick}>show dialog</button>
      </p>
      <p>
        <button type="button" className="btn btn-primary" onClick={() => { setOpen(!open) }}>{open ? '关闭' : '开启'}拖拽</button>
      </p>
      <Dialog
        visible={visible}
        animation="slide-fade"
        maskAnimation="fade"
        draggable={open}
        onClose={onClose}
        style={{ width: 600 }}
      >
        <div
          style={{
            height: 200,
          }}
        >
          Day before yesterday I saw a rabbit, and yesterday a deer, and today, you.
        </div>
      </Dialog>
    </div>
  );
};

export default MyControl;

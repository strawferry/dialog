import classNames from 'classnames';
import { useComposeRef } from 'rc-util/lib/ref';
import React, { useRef, useState } from 'react';
import { RefContext } from '../../context';
import type { IDialogPropTypes } from '../../IDialogPropTypes';
import MemoChildren from './MemoChildren';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';


const sentinelStyle = { width: 0, height: 0, overflow: 'hidden', outline: 'none' };

export interface PanelProps extends Omit<IDialogPropTypes, 'getOpenCount'> {
  prefixCls: string;
  ariaId?: string;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  holderRef?: React.Ref<HTMLDivElement>;
}

export type ContentRef = {
  focus: () => void;
  changeActive: (next: boolean) => void;
};

const Panel = React.forwardRef<ContentRef, PanelProps>((props, ref) => {
  const {
    prefixCls,
    className,
    style,
    title,
    ariaId,
    footer,
    closable,
    closeIcon,
    onClose,
    children,
    bodyStyle,
    bodyProps,
    modalRender,
    onMouseDown,
    onMouseUp,
    draggable = true,
    holderRef,
    visible,
    forceRender,
    width,
    height,
    classNames: modalClassNames,
    styles: modalStyles,
  } = props;

  const [disabled, setDisabled] = React.useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  // ================================= Refs =================================
  const { panel: panelRef } = React.useContext(RefContext);
  const draggleRef = useRef<HTMLDivElement>(null);

  const mergedRef = useComposeRef(holderRef, panelRef);

  const sentinelStartRef = useRef<HTMLDivElement>();
  const sentinelEndRef = useRef<HTMLDivElement>();

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      sentinelStartRef.current?.focus();
    },
    changeActive: (next) => {
      const { activeElement } = document;
      if (next && activeElement === sentinelEndRef.current) {
        sentinelStartRef.current.focus();
      } else if (!next && activeElement === sentinelStartRef.current) {
        sentinelEndRef.current.focus();
      }
    },
  }));

  // ================================ Style =================================
  const contentStyle: React.CSSProperties = {};

  if (width !== undefined) {
    contentStyle.width = width;
  }
  if (height !== undefined) {
    contentStyle.height = height;
  }
  // ================================ Render ================================
  let footerNode: React.ReactNode;
  if (footer) {
    footerNode = <div className={classNames(`${prefixCls}-footer`, modalClassNames?.footer)} style={{ ...modalStyles?.footer }}>{footer}</div>;
  }

  let headerNode: React.ReactNode;
  if (title) {
    headerNode = (
      <div className={classNames(`${prefixCls}-header`, modalClassNames?.header)} style={{ ...modalStyles?.header }}>
        <div className={`${prefixCls}-title`} id={ariaId}>
          {title}
        </div>
      </div>
    );
  }

  let closer: React.ReactNode;
  if (closable) {
    closer = (
      <button type="button" onClick={onClose} aria-label="Close" className={`${prefixCls}-close`}>
        {closeIcon || <span className={`${prefixCls}-close-x`} />}
      </button>
    );
  }

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const content = draggable ? <Draggable
    disabled={disabled}
    bounds={bounds}
    nodeRef={draggleRef}
    onStart={(event, uiData) => onStart(event, uiData)}>
    <div ref={draggleRef} className={classNames(`${prefixCls}-content`, modalClassNames?.content)} style={modalStyles?.content}>
      {draggable && <div
        style={{
          position: 'absolute',
          top: '-10px',
          width: '100%',
          height: '20px',
          cursor: 'move',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={() => {
          if (disabled) {
            setDisabled(false)
          }
        }}
        onMouseOut={() => {
          setDisabled(true)
        }} />}
      {closer}
      {headerNode}
      <div className={classNames(`${prefixCls}-body`, modalClassNames?.body)} style={{ ...bodyStyle, ...modalStyles?.body }} {...bodyProps}>
        {children}
      </div>
      {footerNode}
    </div>
  </Draggable> : <div className={classNames(`${prefixCls}-content`, modalClassNames?.content)} style={modalStyles?.content}>
    {closer}
    {headerNode}
      <div className={classNames(`${prefixCls}-body`, modalClassNames?.body)} style={{ ...bodyStyle, ...modalStyles?.body }} {...bodyProps}>
        {children}
      </div>
      {footerNode}
    </div>

  return (
    <div
      key="dialog-element"
      role="dialog"
      aria-labelledby={title ? ariaId : null}
      aria-modal="true"
      ref={mergedRef}
      style={{
        ...style,
        ...contentStyle,
      }}
      className={classNames(prefixCls, className)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div tabIndex={0} ref={sentinelStartRef} style={sentinelStyle} aria-hidden="true" />
      <MemoChildren shouldUpdate={visible || forceRender}>
        {modalRender ? modalRender(content) : content}
      </MemoChildren>
      <div tabIndex={0} ref={sentinelEndRef} style={sentinelStyle} aria-hidden="true" />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  Panel.displayName = 'Panel';
}

export default Panel;

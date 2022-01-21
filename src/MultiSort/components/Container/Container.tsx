import React, { forwardRef, useState } from "react";
import classNames from "classnames";

import { Action, Handle, Remove } from "../Item";

import styles from "./Container.module.scss";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  onClick?(): void;
  onRemove?(): void;
  isDragging?: boolean;
  containerId?: string;
}

export const Container = forwardRef<any, any>(
  (
    {
      children,
      handleProps,
      horizontal,
      hover,
      onClick,
      label,
      placeholder,
      style,
      shadow,
      unstyled,
      isDragging = false,
      containerId = "",
      ...props
    }: Props,
    ref
  ) => {
    const Component = onClick ? "button" : "div";
    const [collapsed /* , setCollapsed */] = useState(false);

    // const handleCollapse = () => setCollapsed((prev) => !prev);
    return (
      <Component
        {...props}
        ref={ref}
        style={
          {
            ...style,
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          placeholder && styles.placeholder,
          shadow && styles.shadow,
          collapsed && styles.collapsed
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <div className={styles.Header}>
            {label}
            {/* <div className={styles.Actions}>
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
              {placeholder ? null : (
                <> */}
            {/* <button onClick={handleCollapse}>
              {collapsed ? "show" : "hide"}
            </button> */}
            {/* <Action onClick={() => handleAddItem(containerId)}>+</Action>
                </>
              )}
              <Handle {...handleProps} />
            </div> */}
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);

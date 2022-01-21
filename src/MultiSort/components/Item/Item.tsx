import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { DraggableSyntheticListeners, useDraggable } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";

import { Handle, Remove } from "./components";

import styles from "./Item.module.scss";
import { Rnd } from "react-rnd";
import { setTranslateVal } from "../Container/FloatContainer";
import { getInitialPositionProps, MapValueProps } from "../..";
import { cardStyle } from "../../constants/shortcutBar";
export interface Props {
  dragOverlay?: boolean;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listenerss?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: string;
  onRemove?(): void;
  onDelete?: (...args: any[]) => void;
  getInitialPosition?: (e: getInitialPositionProps) => void;
  getMapValue?: MapValueProps;
  translate?: getInitialPositionProps;
  isFloating?: boolean;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        index,
        listenerss,
        onRemove,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        onDelete = () => null,
        getInitialPosition,
        getMapValue,
        translate,
        isFloating,
      },
      ref
    ) => {
      const [resizeId, setResizeId] = useState<string>("");
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";
        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      const handleDelete = () => {
        onDelete();
      };
      const getElemPosition = (e: any) => {
        if (
          isFloating === true &&
          setTranslateVal.get(resizeId) !== undefined
        ) {
          const mapkey = setTranslateVal.get(resizeId);
          const currentElemPos = {
            x: e.currentTarget.getBoundingClientRect().x + mapkey!.leftWidth,
            y: e.currentTarget.getBoundingClientRect().y + mapkey!.topHeight,
          };
          getInitialPosition!(currentElemPos);
        } else {
          const currentElemPos = {
            x: e.currentTarget.getBoundingClientRect().x,
            y: e.currentTarget.getBoundingClientRect().y,
          };
          getInitialPosition!(currentElemPos);
        }
      };
      const { attributes, listeners, setNodeRef, active, isDragging } =
        useDraggable({
          id: value,
        });

      const customStyle = {
        style,
        height: "100%",
      };
      useEffect(() => {
        if (
          isDragging === true &&
          setTranslateVal.get(active?.id!) === undefined
        ) {
          setTranslateVal.set(active?.id!, {
            translate: translate!,
            width: cardStyle.width,
            height: cardStyle.height,
            leftWidth: 0,
            topHeight: 0,
            isFloating: true,
          });
        }
        if (
          isDragging === true &&
          setTranslateVal.get(active?.id!) !== undefined
        ) {
          const mapValue = setTranslateVal.get(active?.id!);
          setTranslateVal.set(active?.id!, {
            translate: translate!,
            width: mapValue!.width,
            height: mapValue!.height,
            leftWidth: mapValue!.leftWidth,
            topHeight: mapValue!.topHeight,
            isFloating: true,
          });
        }
        if (
          isFloating === false &&
          setTranslateVal.get(active?.id!) !== undefined
        ) {
          const mapValue = setTranslateVal.get(active?.id!);
          setTranslateVal.set(active?.id!, {
            translate: translate!,
            width: mapValue!.width,
            height: mapValue!.height,
            leftWidth: 0,
            topHeight: 0,
            isFloating: false,
          });
        }
      }, [translate]);

      return (
        // <div style={isFloating === true ? styleFloating : {}}>
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay
          )}
          style={
            isDragging === true && isFloating === true
              ? { display: "none" }
              : getMapValue && isFloating === false
              ? ({
                  ...wrapperStyle,
                  transition,
                  "--translate-x": transform
                    ? `${Math.round(transform.x)}px`
                    : undefined,
                  "--translate-y": transform
                    ? `${Math.round(transform.y)}px`
                    : undefined,
                  "--scale-x": transform?.scaleX
                    ? `${transform.scaleX}`
                    : undefined,
                  "--scale-y": transform?.scaleY
                    ? `${transform.scaleY}`
                    : undefined,
                  "--index": index,
                  minWidth: getMapValue.width,
                  width: getMapValue.width,
                } as React.CSSProperties)
              : isFloating === false
              ? ({
                  ...wrapperStyle,
                  transition,
                  "--translate-x": transform
                    ? `${Math.round(transform.x)}px`
                    : undefined,
                  "--translate-y": transform
                    ? `${Math.round(transform.y)}px`
                    : undefined,
                  "--scale-x": transform?.scaleX
                    ? `${transform.scaleX}`
                    : undefined,
                  "--scale-y": transform?.scaleY
                    ? `${transform.scaleY}`
                    : undefined,
                  "--index": index,
                } as React.CSSProperties)
              : isFloating === true && getMapValue!.translate !== undefined
              ? {
                  transform: `translate(${getMapValue!.translate.x}px, ${
                    getMapValue!.translate.y
                  }px)`,
                  display: "inline-block",
                  minWidth: getMapValue!.width,
                  width: getMapValue!.width,
                  height: getMapValue!.height,
                  position: "absolute",
                }
              : {}
          }
          ref={ref}
        >
          <Rnd
            id={value}
            disableDragging
            enableResizing={
              isFloating === false
                ? { right: true }
                : {
                    right: true,
                    topRight: true,
                    bottomRight: true,
                    left: true,
                    topLeft: true,
                    bottomLeft: true,
                    top: true,
                    bottom: true,
                  }
            }
            default={
              getMapValue
                ? {
                    x: 0,
                    y: 0,
                    width: getMapValue.width ?? cardStyle.width,
                    height: getMapValue.height ?? cardStyle.height,
                  }
                : {
                    x: 0,
                    y: 0,
                    width: cardStyle.width,
                    height: cardStyle.height,
                  }
            }
            onResize={(e, direction, ref) => {
              if (isFloating === false) {
                let resizable = ref.parentNode as HTMLDivElement;
                resizable.style.minWidth = `${ref.offsetWidth}px`;
              }
            }}
            onResizeStop={(e, direction, ref, position) => {
              if (isFloating === false) {
                setTranslateVal.set(ref.id, {
                  translate: { x: 0, y: 0 },
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  leftWidth: 0,
                  topHeight: 0,
                  isFloating: false,
                });
              }
              if (
                isFloating === true ||
                direction === "right" ||
                direction === "bottomRight" ||
                direction === "bottom"
              ) {
                const mapKey = setTranslateVal.get(ref.id);
                setTranslateVal.set(ref.id, {
                  translate: mapKey!.translate,
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  leftWidth: mapKey!.leftWidth,
                  topHeight: mapKey!.topHeight,
                  isFloating: true,
                });
              }
              if (
                direction === "left" ||
                direction === "top" ||
                direction === "topRight" ||
                direction === "topLeft" ||
                (direction === "bottomLeft" && isFloating === true)
              ) {
                const mapKey = setTranslateVal.get(ref.id);
                if (
                  (mapKey!.leftWidth !== 0 && direction === "left") ||
                  direction === "bottomLeft"
                ) {
                  const updatedLeftWidth = mapKey!.leftWidth + position.width;
                  setTranslateVal.set(ref.id, {
                    translate: mapKey!.translate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    leftWidth: updatedLeftWidth,
                    topHeight: mapKey!.topHeight,
                    isFloating: true,
                  });
                  setResizeId(ref.id);
                }
                if (
                  (mapKey!.topHeight !== 0 && direction === "top") ||
                  direction === "topRight"
                ) {
                  const updatedTopHeight = mapKey!.topHeight + position.height;
                  setTranslateVal.set(ref.id, {
                    translate: mapKey!.translate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    leftWidth: mapKey!.leftWidth,
                    topHeight: updatedTopHeight,
                    isFloating: true,
                  });
                  setResizeId(ref.id);
                }
                if (
                  mapKey!.topHeight !== 0 &&
                  mapKey!.leftWidth !== 0 &&
                  direction === "topLeft"
                ) {
                  const updatedTopHeight = mapKey!.topHeight + position.height;
                  const updatedLeftWidth = mapKey!.leftWidth + position.width;

                  setTranslateVal.set(ref.id, {
                    translate: mapKey!.translate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    leftWidth: updatedLeftWidth,
                    topHeight: updatedTopHeight,
                    isFloating: true,
                  });
                  setResizeId(ref.id);
                }
                if (mapKey!.leftWidth === 0 && direction === "left") {
                  setTranslateVal.set(ref.id, {
                    translate: mapKey!.translate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    leftWidth: position.width,
                    topHeight: mapKey!.topHeight,
                    isFloating: true,
                  });
                  setResizeId(ref.id);
                }
                if (mapKey!.topHeight === 0 && direction === "top") {
                  setTranslateVal.set(ref.id, {
                    translate: mapKey!.translate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    leftWidth: mapKey!.leftWidth,
                    topHeight: position.height,
                    isFloating: true,
                  });
                  setResizeId(ref.id);
                }
                if (
                  mapKey!.topHeight === 0 &&
                  mapKey!.leftWidth === 0 &&
                  direction === "topLeft"
                ) {
                  setTranslateVal.set(ref.id, {
                    translate: mapKey!.translate,
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                    leftWidth: position.width,
                    topHeight: position.height,
                    isFloating: true,
                  });
                  setResizeId(ref.id);
                }
              }
            }}
          >
            <div
              {...attributes}
              ref={setNodeRef}
              className={classNames(
                styles.Item,
                dragging && styles.dragging,
                handle && styles.withHandle,
                dragOverlay && styles.dragOverlay,
                disabled && styles.disabled
              )}
              style={customStyle}
              onMouseDown={(e) => {
                getElemPosition(e);
              }}
            >
              {value}
              <div className={styles.Actions}>
                {onRemove ? (
                  <Remove className={styles.Remove} onClick={onRemove} />
                ) : null}
                {isFloating === false ? (
                  <Remove
                    className={styles.RemoveItem}
                    onClick={handleDelete}
                  />
                ) : null}
                {isFloating === false ? (
                  <Handle {...listenerss} />
                ) : (
                  <Handle {...listeners} />
                )}
              </div>
            </div>
          </Rnd>
        </li>
        // </div>
      );
    }
  )
);

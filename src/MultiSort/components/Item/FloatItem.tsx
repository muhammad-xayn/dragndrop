import React, { useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Rnd } from "react-rnd";

interface FloatItemsProps {
  key: any;
  id: any;
  translate: any;
  getIdValue: any;
  getInitialPosition: any;
  index: any;
  getResizingValues: any;
}

const styled: any = {
  minWidth: 200,
  minHeight: 200,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid black",
  // margin: "10px 0",
  background: "white",
};
const FloatItems: React.FunctionComponent<FloatItemsProps> = ({
  id,
  translate,
  getIdValue,
  getInitialPosition,
  getResizingValues,
  index,
}) => {
  const { attributes, listeners, setNodeRef, active, isDragging } =
    useDraggable({
      id,
    });
  // console.log("TRANSLATEE", translate.width)
  const style = {
    transform: `translate(${translate.translate.x}px, ${translate.translate.y}px)`,
    // width: 200,
    display: "inline-block",
  };
  useEffect(() => {
    if (active?.id !== undefined && isDragging === true) {
      getIdValue(active?.id);
    }
  }, [active?.id]);
  const getElemPosition = (e: any) => {
    const currentElemPos = {
      x: e.currentTarget.getBoundingClientRect().x,
      y: e.currentTarget.getBoundingClientRect().y,
    };
    getInitialPosition(currentElemPos);
  };
  // console.log("INDEX", index)
  return (
    <div
      onMouseDown={(e) => {
        getElemPosition(e);
      }}
    >
      <Rnd
        style={style}
        id={id}
        disableDragging
        size={{ width: translate.width, height: translate.height }}
        onResize={(e, direction, ref) => {
          const resizingFreeFloat = {
            id: id,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          };
          getResizingValues(resizingFreeFloat);
          // console.log("resizingFreeFloat", resizingFreeFloat)
        }}
      >
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={
            translate.width !== undefined
              ? { height: translate.height, width: translate.width }
              : {}
          }
        >
          <span style={styled}>{id}</span>
        </div>
      </Rnd>
    </div>
  );
};

export default FloatItems;

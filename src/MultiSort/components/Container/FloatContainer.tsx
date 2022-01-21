import React, { CSSProperties } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Item } from "../Item/Item";
import { getInitialPositionProps, MapValueProps } from "../..";
import { cardStyle } from "../../constants/shortcutBar";

const containerStyle: CSSProperties = {
  background: "#dadada",
  height: "55vh",
  touchAction: "none",
};
interface FloatFreeContainerProps {
  id: string;
  items: any;
  translate: getInitialPositionProps;
  activeId: string | null;
  getInitialPosition: (e: getInitialPositionProps) => void;
}

export const setTranslateVal = new Map<string, MapValueProps>();

const FloatFreeContainer: React.FunctionComponent<FloatFreeContainerProps> = ({
  id,
  items,
  translate,
  getInitialPosition,
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });
  return (
    <div ref={setNodeRef} style={containerStyle}>
      {items.map((item: any, index: number) => (
        <Item
          key={item}
          value={item}
          getMapValue={
            setTranslateVal.get(item) ?? {
              translate: { x: 0, y: 0 },
              width: cardStyle.width,
              height: cardStyle.height,
              leftWidth: 0,
              topHeight: 0,
              isFloating: true,
            }
          }
          getInitialPosition={getInitialPosition}
          index={index}
          isFloating={true}
          translate={translate}
          handle
        />
      ))}
    </div>
  );
};

export default FloatFreeContainer;

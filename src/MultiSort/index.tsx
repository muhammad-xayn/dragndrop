import React, { useEffect, useRef, useState } from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import {
  CancelDrop,
  pointerWithin,
  DndContext,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensors,
  useSensor,
  Translate,
} from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  SortableContext,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { Item, Container, ContainerProps } from "./components";

import { createRange } from "./utilities";
import FloatFreeContainer from "./components/Container/FloatContainer";
import { setTranslateVal } from "./components/Container/FloatContainer";
import { cardStyle } from "./constants/shortcutBar";

export interface MapValueProps {
  translate: Translate;
  width: number;
  height: number;
  leftWidth: number;
  topHeight: number;
  isFloating: boolean;
}
const defaultCoordinates = {
  x: 0,
  y: 0, // -275
};
export default {
  title: "Presets/Sortable/Multiple Containers",
};
const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges(args) : true;

function DroppableContainer({
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: string;
  items: string[];
  style?: React.CSSProperties;
}) {
  const { active, isDragging, over, setNodeRef, transition, transform } =
    useSortable({
      id,
      data: {
        type: "container",
      },
      animateLayoutChanges,
    });

  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      isDragging={isDragging}
      containerId={id}
      {...props}
    ></Container>
  );
}

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

type Items = Record<string, string[]>;

interface Props {
  cancelDrop?: CancelDrop;
  containerStyle?: React.CSSProperties;
  getItemStyles?: (args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }) => React.CSSProperties;
  wrapperStyle?: (args: { index: number }) => React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  strategy?: SortingStrategy;
  minimal?: boolean;
  vertical?: boolean;
}
export interface getInitialPositionProps {
  x: number;
  y: number;
}
const PLACEHOLDER_ID = "placeholder";

interface SortableItemProps {
  containerId: string;
  id: string;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: any): React.CSSProperties;
  getIndex(id: string): number;
  // wrapperStyle({ index }: { index: number }): React.CSSProperties;
  wrapperStyle: any;
  onDelete?: (id: string) => void;
  getInitialPosition?: (e: getInitialPositionProps) => void;
  getMapValue: MapValueProps;
}
function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  style,
  containerId,
  getIndex,
  wrapperStyle,
  getInitialPosition,
  onDelete = () => null,
}: SortableItemProps) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      getInitialPosition={getInitialPosition}
      getMapValue={setTranslateVal.get(id)}
      transition={transition}
      transform={transform}
      listenerss={listeners}
      isFloating={false}
      onDelete={() => {
        onDelete(id);
      }}
    />
  );
}

export function MultipleContainers({
  itemCount = 2,
  cancelDrop,
  handle = false,
  items: initialItems,
  containerStyle,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  strategy = horizontalListSortingStrategy,
  vertical = false,
}: Props) {
  const [translate, setTranslate] = useState<getInitialPositionProps>({
    x: 0,
    y: 0,
  });
  const [initialPosition, setInitialPosition] =
    useState<getInitialPositionProps>({
      x: 0,
      y: 0,
    });
  const getInitialPosition = (e: getInitialPositionProps) => {
    setInitialPosition(e);
  };
  const [items, setItems] = useState<Items>(
    () =>
      initialItems ?? {
        A: createRange(itemCount, (index) => `A${index + 1}`),
        B: createRange(itemCount, (index) => `B${index + 1}`),
        F: [],
      }
  );
  const [containers, setContainers] = useState(Object.keys(items));
  const [activeId, setActiveId] = useState<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: string) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const onDragCancel = () => {
    if (clonedItems) {
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  const onDelete = (deleteId: string) => {
    const activeContainer = findContainer(deleteId);
    if (activeContainer) {
      setItems((items) => ({
        ...items,
        [activeContainer]: items[activeContainer].filter(
          (id) => id !== deleteId
        ),
      }));
      setActiveId(null);
    }
  };

  function renderSortableItemDragOverlay(id: string) {
    const dimensions = setTranslateVal.get(id);
    return (
      <div
        style={
          dimensions
            ? {
                width: dimensions.width,
                height: dimensions.height,
                background: "white",
                opacity: 0.9,
                border: 1,
                borderStyle: "solid",
                borderColor: "gray",
              }
            : {
                width: cardStyle.width,
                height: cardStyle.height,
                background: "white",
                opacity: 0.9,
                border: 1,
                borderStyle: "solid",
                borderColor: "gray",
              }
        }
      ></div>

      // <Item
      //   value={id}
      //   handle={handle}
      //   style={getItemStyles({
      //     containerId: findContainer(id) as string,
      //     overIndex: -1,
      //     index: getIndex(id),
      //     value: id,
      //     isSorting: true,
      //     isDragging: true,
      //     isDragOverlay: true,
      //   })}
      //   wrapperStyle={wrapperStyle({ index: 0 })}
      //   dragOverlay
      // />
    );
  }

  function renderContainerDragOverlay(containerId: string) {
    return (
      <Container
        label={`Column ${containerId}`}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item, index) => (
          <Item
            key={item}
            value={item}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(item),
              value: item,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            wrapperStyle={wrapperStyle({ index })}
            getMapValue={setTranslateVal.get(item)}
          />
        ))}
      </Container>
    );
  }

  function getNextContainerId() {
    const containeIds = Object.keys(items);
    const lastContaineId = containeIds[containeIds.length - 1];

    return String.fromCharCode(lastContaineId.charCodeAt(0) + 1);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragMove={(event) => {
        setTranslate({
          x: initialPosition.x + event.delta.x - 9,
          y: initialPosition.y + event.delta.y - 355,
        });
      }}
      onDragOver={(event) => {
        const overId = event.over?.id;

        if (!overId || overId === "TRASH_ID" || event.active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(event.active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = overItems.indexOf(overId);
            const activeIndex = activeItems.indexOf(event.active.id);

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.length + 1;
            } else {
              const isBelowOverItem =
                event.over &&
                event.active.rect.current.translated &&
                event.active.rect.current.translated.top >
                  event.over.rect.top + event.over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex =
                overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (item) => item !== event.active.id
              ),
              [overContainer]: [
                ...items[overContainer].slice(0, newIndex),
                items[activeContainer][activeIndex],
                ...items[overContainer].slice(
                  newIndex,
                  items[overContainer].length
                ),
              ],
            };
          });
        }
      }}
      onDragEnd={(event) => {
        setTranslate(defaultCoordinates);
        if (event.active.id in items && event.over?.id) {
          setContainers((containers) => {
            const activeIndex = containers.indexOf(event.active.id);
            const overIndex = containers.indexOf(event.over!.id);
            return arrayMove(containers, activeIndex, overIndex);
          });
        }

        const activeContainer = findContainer(event.active.id);
        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = event.over?.id;

        if (!overId) {
          setActiveId(null);
          return;
        }
        if (overId === PLACEHOLDER_ID) {
          const newContainerId = getNextContainerId();

          unstable_batchedUpdates(() => {
            setContainers((containers) => [...containers, newContainerId]);
            setItems((items) => ({
              ...items,
              [activeContainer]: items[activeContainer].filter(
                (id) => id !== activeId
              ),
              [newContainerId]: [event.active.id],
            }));
            setActiveId(null);
          });
          return;
        }

        const overContainer = findContainer(overId);
        if (overContainer) {
          const activeIndex = items[activeContainer].indexOf(event.active.id);
          const overIndex = items[overContainer].indexOf(overId);

          if (activeIndex !== overIndex && event.over?.id !== "F") {
            setItems((items) => ({
              ...items,
              [overContainer]: arrayMove(
                items[overContainer],
                activeIndex,
                overIndex
              ),
            }));
          }
        }

        setActiveId(null);
      }}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          {containers.map((containerId) => {
            if (containerId !== "F") {
              return (
                <DroppableContainer
                  key={containerId}
                  id={containerId}
                  label={minimal ? undefined : `Column ${containerId}`}
                  items={items[containerId]}
                  style={containerStyle}
                >
                  <SortableContext
                    items={items[containerId]}
                    strategy={strategy}
                  >
                    {items[containerId].map((value, index) => {
                      return (
                        <SortableItem
                          disabled={isSortingContainer}
                          key={value}
                          id={value}
                          index={index}
                          handle={handle}
                          style={getItemStyles}
                          wrapperStyle={wrapperStyle}
                          containerId={containerId}
                          getIndex={getIndex}
                          onDelete={onDelete}
                          getInitialPosition={getInitialPosition}
                          getMapValue={setTranslateVal.get(value)!}
                        />
                      );
                    })}
                  </SortableContext>
                </DroppableContainer>
              );
            }
          })}
        </SortableContext>
      </div>
      <FloatFreeContainer
        id="F"
        items={items.F}
        translate={translate}
        activeId={activeId}
        getInitialPosition={getInitialPosition}
      />
      {createPortal(
        <DragOverlay
          dropAnimation={dropAnimation}
          modifiers={[restrictToWindowEdges]}
        >
          {activeId
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

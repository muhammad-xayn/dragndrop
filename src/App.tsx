import { Modifier } from "@dnd-kit/core";
import { MultipleContainers } from "./MultiSort";
import "./styles.css";

export const restrictToVerticalAxis: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: 0,
  };
};

export default function App() {
  return (
    <MultipleContainers
      itemCount={5}
      vertical={false}
      handle
      // modifiers={[restrictToVerticalAxis]}
    />
  );
}

// @flow
import { colors } from '@atlaskit/theme';
import styled from '@emotion/styled';
import React from 'react';
import type {
  DraggableProvided,
  DraggableStateSnapshot
} from '../../../../src';
import { Draggable } from '../../../../src';
import { borderRadius, grid } from '../../constants';
import type { Id, Task as TaskType } from '../types';

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const primaryButton = 0;

type Props = {|
  task: TaskType,
  index: number,
  isSelected: boolean,
  isGhosting: boolean,
  selectionCount: number,
  toggleSelection: (taskId: Id) => void,
  toggleSelectionInGroup: (taskId: Id) => void,
  multiSelectTo: (taskId: Id) => void,
|};

type GetBackgroundColorArgs = {|
  isSelected: boolean,
  isDragging: boolean,
  isGhosting: boolean,
|};

const getBackgroundColor = ({
  isSelected,
  isGhosting,
}: GetBackgroundColorArgs): string => {
  if (isGhosting) {
    return colors.N10;
  }

  if (isSelected) {
    return colors.B50;
  }

  return colors.N10;
};

const getColor = ({ isSelected, isGhosting }): string => {
  if (isGhosting) {
    return 'darkgrey';
  }
  if (isSelected) {
    return colors.B200;
  }
  return colors.N900;
};

const Container = styled.div`
  background-color: ${(props) => getBackgroundColor(props)};
  color: ${(props) => getColor(props)};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  font-size: 18px;
  border: 3px solid ${colors.N90};
  ${(props) =>
    props.isDragging ? `box-shadow: 2px 2px 1px ${colors.N90};` : ''} ${(
    props,
  ) =>
    props.isGhosting
      ? 'opacity: 0.8;'
      : ''}

  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:focus {
    outline: none;
    border-color: ${colors.G200};
  }
`;
/* stylelint-disable block-no-empty */
const Content = styled.div``;
/* stylelint-enable */
const size: number = 30;

const SelectionCount = styled.div`
  right: -${grid}px;
  top: -${grid}px;
  color: ${colors.N0};
  background: ${colors.green};
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};

const Task = (props: Props) => {
  // Determines if the platform specific toggle selection in group key was used
  const wasToggleInSelectionGroupKeyUsed = (
    event: MouseEvent | KeyboardEvent,
  ) => {
    const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  // Determines if the multiSelect key was used
  const wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) =>
    event.shiftKey;

  const performAction = (event: MouseEvent | KeyboardEvent) => {
    const {
      task,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo,
    } = props;

    if (wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }

    if (wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }

    toggleSelection(task.id);
  };

  const onKeyDown = (
    event: KeyboardEvent,
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    performAction(event);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    performAction(event);
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    props.toggleSelectionInGroup(props.task.id);
  };

  const task: TaskType = props.task;
  const index: number = props.index;
  const isSelected: boolean = props.isSelected;
  const selectionCount: number = props.selectionCount;
  const isGhosting: boolean = props.isGhosting;
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        const shouldShowSelection: boolean =
          snapshot.isDragging && selectionCount > 1;

        return (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            onTouchEnd={onTouchEnd}
            onKeyDown={(event: KeyboardEvent) =>
              onKeyDown(event, provided, snapshot)
            }
            isDragging={snapshot.isDragging}
            isSelected={isSelected}
            isGhosting={isGhosting}
          >
            <Content>{task.content}</Content>
            {shouldShowSelection ? (
              <SelectionCount>{selectionCount}</SelectionCount>
            ) : null}
          </Container>
        );
      }}
    </Draggable>
  );
};

export default Task;

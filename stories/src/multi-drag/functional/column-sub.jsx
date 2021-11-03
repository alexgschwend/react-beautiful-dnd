// @flow
import { colors } from '@atlaskit/theme';
import styled from '@emotion/styled';
import memoizeOne from 'memoize-one';
import React from 'react';
import type {
  DroppableProvided,
  DroppableStateSnapshot
} from '../../../../src';
import { Droppable } from '../../../../src';
import { borderRadius, grid } from '../../constants';
import type { Id, Task as TaskType } from '../types';
import Task from './task';
import type { Column as ColumnType } from './types';

type Props = {|
  column: ColumnType,
  tasks: TaskType[],
  selectedTaskIds: Id[],
  draggingTaskId: ?Id,
  toggleSelection: (taskId: Id) => void,
  toggleSelectionInGroup: (taskId: Id) => void,
  multiSelectTo: (taskId: Id) => void,
|};

// $ExpectError - not sure why
const Container = styled.div`
  width: 400px;
  margin: ${grid}px;
  border-radius: ${borderRadius}px;
  border: 1px solid ${colors.N100};
  background-color: ${colors.N10};

  /* we want the column to take up its full height */
  display: flex;
  flex-direction: column;
  max-height: 250px;
  overflow-y: auto;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: ${grid}px;
`;

const TaskList = styled.div`
  padding: ${grid}px;
  min-height: 200px;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${(props) =>
    props.isDraggingOver ? `background-color: ${colors.N200}` : ''};
`;

type TaskIdMap = {
  [taskId: Id]: true,
};

const getSelectedMap = memoizeOne((selectedTaskIds: Id[]) =>
  selectedTaskIds.reduce((previous: TaskIdMap, current: Id): TaskIdMap => {
    previous[current] = true;
    return previous;
  }, {}),
);

const ColumnSub = (props: Props) => {
  const column: ColumnType = props.column;
  const tasks: TaskType[] = props.tasks;
  const selectedTaskIds: Id[] = props.selectedTaskIds;
  const draggingTaskId: ?Id = props.draggingTaskId;
  return (
    <Container>
      <Title>{column.title}</Title>
      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
          <TaskList
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {tasks.map((task: TaskType, index: number) => {
              const isSelected: boolean = Boolean(
                getSelectedMap(selectedTaskIds)[task.id],
              );
              const isGhosting: boolean =
                isSelected &&
                Boolean(draggingTaskId) &&
                draggingTaskId !== task.id;
              return (
                <Task
                  task={task}
                  index={index}
                  key={task.id}
                  isSelected={isSelected}
                  isGhosting={isGhosting}
                  selectionCount={selectedTaskIds.length}
                  toggleSelection={props.toggleSelection}
                  toggleSelectionInGroup={props.toggleSelectionInGroup}
                  multiSelectTo={props.multiSelectTo}
                />
              );
            })}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </Container>
  );
};

export default ColumnSub;

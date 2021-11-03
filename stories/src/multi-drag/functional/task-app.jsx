// @flow
import styled from '@emotion/styled';
import React, { useCallback, useEffect, useState } from 'react';
import type { DraggableLocation, DragStart, DropResult } from '../../../../src';
import { DragDropContext } from '../../../../src';
import type { Id, Task } from '../types';
import Column from './column';
import ColumnSub from './column-sub';
import initial from './data';
import type { Entities } from './types';
import type { Result as ReorderResult } from './utils';
import { multiSelectTo as multiSelect, mutliDragAwareReorder } from './utils';

const Container = styled.div`
  display: flex;
  user-select: none;
  flex-direction: column;
`;

const MainContainer = styled.div`
  display: flex;
`;

const getTasks = (entities: Entities, columnId: Id): Task[] =>
  entities.columns[columnId].taskIds.map(
    (taskId: Id): Task => entities.tasks[taskId],
  );
const TaskAppFunctional = () => {
  const [entities, setEntities] = useState(initial);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const unselectAll = () => {
    setSelectedTaskIds([]);
  };

  const onDragStart = (start: DragStart) => {
    const id: string = start.draggableId;
    const selected: ?Id = selectedTaskIds.find(
      (taskId: Id): boolean => taskId === id,
    );

    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      unselectAll();
    }
    setDraggingTaskId(start.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    const destination: ?DraggableLocation = result.destination;
    const source: DraggableLocation = result.source;

    // nothing to do
    if (!destination || result.reason === 'CANCEL') {
      setDraggingTaskId(null);
      return;
    }

    const processed: ReorderResult = mutliDragAwareReorder({
      entities,
      selectedTaskIds,
      source,
      destination,
    });

    setEntities(processed.entities);
    setSelectedTaskIds(processed.selectedTaskIds);
    setDraggingTaskId(null);
  };

  const onWindowKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Escape') {
      unselectAll();
    }
  }, []);

  const onWindowClick = useCallback((event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  }, []);

  const onWindowTouchEnd = useCallback((event: TouchEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    unselectAll();
  }, []);

  const toggleSelection = (taskId: Id) => {
    const newSelectedTaskIds: Id[] = selectedTaskIds;
    const wasSelected: boolean = newSelectedTaskIds.includes(taskId);

    const newTaskIds: Id[] = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [taskId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (newSelectedTaskIds.length > 1) {
        return [taskId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    setSelectedTaskIds(newTaskIds);
  };

  const toggleSelectionInGroup = (taskId: Id) => {
    const newSelectedTaskIds: Id[] = selectedTaskIds;
    const index: number = newSelectedTaskIds.indexOf(taskId);

    // if not selected - add it to the selected items
    if (index === -1) {
      setSelectedTaskIds([...newSelectedTaskIds, taskId]);
      return;
    }

    // it was previously selected and now needs to be removed from the group
    const shallow: Id[] = [...newSelectedTaskIds];
    shallow.splice(index, 1);
    setSelectedTaskIds(shallow);
  };

  // This behaviour matches the MacOSX finder selection
  const multiSelectTo = (newTaskId: Id) => {
    const updated: ?(Id[]) = multiSelect(entities, selectedTaskIds, newTaskId);

    if (updated == null) {
      return;
    }

    setSelectedTaskIds(updated);
  };

  useEffect(() => {
    window.addEventListener('click', onWindowClick);
    window.addEventListener('keydown', onWindowKeyDown);
    window.addEventListener('touchend', onWindowTouchEnd);
    return () => {
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('keydown', onWindowKeyDown);
      window.removeEventListener('touchend', onWindowTouchEnd);
    };
  }, [onWindowClick, onWindowKeyDown, onWindowTouchEnd]);

  const currentEntities: Entities = entities;
  const selected: Id[] = selectedTaskIds;

  return (
    <MainContainer>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Container>
          <ColumnSub
            column={currentEntities.columns.progress}
            tasks={getTasks(currentEntities, 'progress')}
            selectedTaskIds={selected}
            key="progress"
            draggingTaskId={draggingTaskId}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
            multiSelectTo={multiSelectTo}
          />
          <ColumnSub
            column={currentEntities.columns.done}
            tasks={getTasks(currentEntities, 'done')}
            selectedTaskIds={selected}
            key="done"
            draggingTaskId={draggingTaskId}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
            multiSelectTo={multiSelectTo}
          />
          <ColumnSub
            column={currentEntities.columns.last}
            tasks={getTasks(currentEntities, 'last')}
            selectedTaskIds={selected}
            key="last"
            draggingTaskId={draggingTaskId}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
            multiSelectTo={multiSelectTo}
          />
        </Container>
        <Container>
          <Column
            column={currentEntities.columns.todo}
            tasks={getTasks(currentEntities, 'todo')}
            selectedTaskIds={selected}
            key="todo"
            draggingTaskId={draggingTaskId}
            toggleSelection={toggleSelection}
            toggleSelectionInGroup={toggleSelectionInGroup}
            multiSelectTo={multiSelectTo}
          />
        </Container>
      </DragDropContext>
    </MainContainer>
  );
};

export default TaskAppFunctional;

// @flow
import type { Id, Task } from '../types';
import type { Column, Entities, TaskMap } from './types';

const tasks: Task[] = Array.from({ length: 20 }, (v, k) => k).map(
  (val: number): Task => ({
    id: `task-${val}`,
    content: `Translate to German ${val}`,
  }),
);

const taskMap: TaskMap = tasks.reduce(
  (previous: TaskMap, current: Task): TaskMap => {
    previous[current.id] = current;
    return previous;
  },
  {},
);

const todo: Column = {
  id: 'todo',
  title: 'Disabled',
  taskIds: tasks.map((task: Task): Id => task.id),
};

const progress: Column = {
  id: 'progress',
  title: 'High Prio',
  taskIds: [],
};

const done: Column = {
  id: 'done',
  title: 'Medium Prio',
  taskIds: [],
};

const last: Column = {
  id: 'last',
  title: 'Low Prio',
  taskIds: [],
};

const entities: Entities = {
  columnOrder: [todo.id, progress.id, done.id, last.id],
  columns: {
    [todo.id]: todo,
    [progress.id]: progress,
    [done.id]: done,
    [last.id]: last,
  },
  tasks: taskMap,
};

export default entities;

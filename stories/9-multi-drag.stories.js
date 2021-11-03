// @flow
import { storiesOf } from '@storybook/react';
import React from 'react';
import TaskAppFunctional from './src/multi-drag/functional/task-app';
import TaskApp from './src/multi-drag/task-app';

storiesOf('Multi drag', module)
  .add('pattern', () => <TaskApp />)
  .add('pattern functional', () => <TaskAppFunctional />);

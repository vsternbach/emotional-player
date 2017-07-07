import { NgModule } from 'angular-ts-decorators';
import { TaskManager } from './task-manager/task-manager.component';

@NgModule({
  name: 'TasksModule',
  declarations: [
    TaskManager
  ]
})
export class TasksModule {}

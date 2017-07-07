/**
 * Created by voland on 4/2/16.
 */
import { NgModule } from 'angular-ts-decorators';
import { AppComponent } from './components/app.component';
import { TasksModule } from './components/tasks.module';
import { EmotionFilter } from './components/task-manager/task-manager.component';

export interface IComponentState extends ng.ui.IState {
  state: string;
  component?: any;
  views?: { [name: string]: IComponentState };
}

@NgModule({
  name: 'AppModule',
  imports: [
    'ui.router',
    TasksModule
  ],
  declarations: [
    AppComponent,
    EmotionFilter
  ]
})
export class AppModule {
  /*@ngInject*/
  config($urlRouterProvider: ng.ui.IUrlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  }

  /*@ngInject*/
  run($window: ng.IWindowService, $q: ng.IQService) {
    // replace browser Promise to $q in app
    $window.Promise = $q;
  }
}

/* global process */
import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngAria from 'angular-aria';
import ngTouch from 'angular-touch';
import ngBootstrap from 'angular-ui-bootstrap';
import uiRouter from '@uirouter/angularjs';
import angularJwt from 'angular-jwt';
import toastr from 'angular-toastr';
import 'ng-file-upload';
import 'ngstorage';
import 'angular-hotkeys';
import 'angular-smart-table';

import '../styles/main.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

// angular config/run/constants
import appConfig from './app.config';
import appConstants from './app.constants';
import appRun from './app.run';

// ui-router routes
import appRouter from './app.router';
import authRouter from './auth/auth.router';
import ncmrRouter from './ncmr/ncmr.router';
import ncmrExternalRouter from './ncmr/external/router';
import ncmrFabricationRouter from './ncmr/fabrication/router';
import ncmrInternalRouter from './ncmr/internal/router';
import pqpRouter from './pqp/router';

// angular components
import appComponent from './app.component';

// angular services
import ApiService from './services/api.service';
import AuthService from './services/auth.service';
import HashService from './services/hash.service';
import HttpErrorInterceptorService from './services/httpErrorInterceptor';
import NcmrService from './services/ncmr.service';
import PqpService from './services/pqp.service';

// angular filters
import FractionFilter from './filters/fraction';
import LookupFilter from './filters/lookup';

// angular directives
import NcmrAttachments from './directives/ncmrAttachments';
import NcmrExternalDetails from './directives/ncmrExternalDetails';
import NcmrInternalDetails from './directives/ncmrInternalDetails';
import NcmrPanelDetails from './directives/ncmrPanelDetails';

import FabBarcodeListenerEventDir from './directives/fabBarcodeEventListener';

// angular controllers
import LoginController from './auth/login.controller';
import NcmrExternalListController from './ncmr/external/list.controller';
import NcmrExternalEditController from './ncmr/external/edit.controller';
import NcmrFabricationListController from './ncmr/fabrication/list.controller';
import NcmrFabricationEditController from './ncmr/fabrication/edit.controller';
import NcmrInternalListController from './ncmr/internal/list.controller';
import NcmrInternalEditController from './ncmr/internal/edit.controller';
import PqpEditController from './pqp/edit/edit.controller';

// copies icon font
require('font-awesome-loader');

export default angular.module('quality-assurance-webapp', [
  angularJwt,
  ngAnimate,
  ngAria,
  ngTouch,
  ngBootstrap,
  toastr,
  uiRouter,
  'cfp.hotkeys',
  'ngFileUpload',
  'ngStorage',
  'smart-table'
])
.constant('ENVIRONNEMENT', process.env.ENV_NAME)
.constant('AppSettings', appConstants)
.config(appConfig)
.config(appRouter)
.config(authRouter)
.config(ncmrRouter)
.config(ncmrExternalRouter)
.config(ncmrFabricationRouter)
.config(ncmrInternalRouter)
.config(pqpRouter)
.run(appRun)
.component('app', appComponent)
.filter('fraction', FractionFilter)
.filter('lookup', LookupFilter)
.service('ApiService', ApiService)
.service('AuthService', AuthService)
.service('HashService', HashService)
.service('httpErrorInterceptor', HttpErrorInterceptorService)
.service('NcmrService', NcmrService)
.service('PqpService', PqpService)
.directive('ncmrAttachments', NcmrAttachments)
.directive('ncmrExternalDetails', NcmrExternalDetails)
.directive('ncmrInternalDetails', NcmrInternalDetails)
.directive('ncmrPanelDetails', NcmrPanelDetails)
.directive('fabBarcodeListenerEventDir', FabBarcodeListenerEventDir)
.controller('LoginController', LoginController)
.controller('NcmrExternalListController', NcmrExternalListController)
.controller('NcmrExternalEditController', NcmrExternalEditController)
.controller('NcmrFabricationListController', NcmrFabricationListController)
.controller('NcmrFabricationEditController', NcmrFabricationEditController)
.controller('NcmrInternalListController', NcmrInternalListController)
.controller('NcmrInternalEditController', NcmrInternalEditController)
.controller('PqpEditController', PqpEditController)
.name;

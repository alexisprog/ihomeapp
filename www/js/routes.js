angular.module('starter.routes', ['satellizer'])

.config(function($stateProvider, $cordovaInAppBrowserProvider, $urlRouterProvider, $authProvider, $ionicConfigProvider, ionicTimePickerProvider) {
  $ionicConfigProvider.views.maxCache(0);

  var options = {
    location: 'no',
    clearcache: 'no',
    toolbar: 'no'
  };

  $cordovaInAppBrowserProvider.setDefaultOptions(options);

  var timePickerObj = {
      inputTime: (((new Date()).getHours() * 60 * 60)),
      format: 12,
      step: 15,
      setLabel: 'Aceptar',
      closeLabel: 'Cerrar'
    };

  ionicTimePickerProvider.configTimePicker(timePickerObj);
  
  //$authProvider.loginUrl = 'http://localhost/ihome/public/api/v1/authenticate'; 
  $authProvider.loginUrl = 'http://ihomeapp.net/api/v1/authenticate'; 

  $stateProvider

  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

  .state('resetpassword', {
      url: '/resetpassword',
      templateUrl: 'templates/resetpassword.html',
      controller: 'ResetpasswordCtrl'
    })

  .state('cambiarpassword', {
      url: '/cambiarpassword',
      templateUrl: 'templates/cambiarpassword.html',
      controller: 'CambiarpasswordCtrl'
    })

  .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'HomeCtrl'
    })

  .state('reportescreate', {
      url: '/reportescreate',
      templateUrl: 'templates/reportescreate.html',
      controller: 'ReportescreateCtrl'
  })

  .state('reportesedit', {
      url: '/reportesedit',
      templateUrl: 'templates/reportesedit.html',
      controller: 'ReporteseditCtrl'
  })

  .state('reportes', {
      url: '/reportes',
      templateUrl: 'templates/reportes.html',
      controller: 'ReportesCtrl'
  })

  .state('noticias', {
      url: '/noticias',
      templateUrl: 'templates/noticias.html',
      controller: 'NoticiasCtrl'
  })

  .state('noticiasshow', {
      url: '/noticiasshow',
      templateUrl: 'templates/noticiasshow.html',
      controller: 'NoticiasshowCtrl'
  })

  .state('noticiascreate', {
      url: '/noticiascreate',
      templateUrl: 'templates/noticiascreate.html',
      controller: 'NoticiascreateCtrl'
  })


  .state('pagos', {
      url: '/pagos',
      templateUrl: 'templates/pagos.html',
      controller: 'PagosCtrl'
  })

   .state('pagosshow', {
      url: '/pagosshow',
      templateUrl: 'templates/pagosshow.html',
      controller: 'PagosshowCtrl'
  })

   .state('pagoscreate', {
      url: '/pagoscreate',
      templateUrl: 'templates/pagoscreate.html',
      controller: 'PagoscreateCtrl'
  })

  .state('vecinos', {
      url: '/vecinos',
      templateUrl: 'templates/vecinos.html',
      controller: 'VecinosCtrl'
  })

  .state('vecinoscreate', {
      url: '/vecinoscreate',
      templateUrl: 'templates/vecinoscreate.html',
      controller: 'VecinoscreateCtrl'
  })

  .state('vecinosperfil', {
      url: '/vecinosperfil',
      templateUrl: 'templates/vecinosperfil.html',
      controller: 'VecinosperfilCtrl'
  })

  .state('servicios', {
      url: '/servicios',
      templateUrl: 'templates/servicios.html',
      controller: 'ServiciosCtrl'
  })

  .state('serviciosshow', {
      url: '/serviciosshow',
      templateUrl: 'templates/serviciosshow.html',
      controller: 'ServiciosshowCtrl'
  })

  .state('serviciosedit', {
      url: '/serviciosedit',
      templateUrl: 'templates/serviciosedit.html',
      controller: 'ServicioseditCtrl'
  })

  .state('servicioscreate', {
      url: '/servicioscreate',
      templateUrl: 'templates/servicioscreate.html',
      controller: 'ServicioscreateCtrl'
  })

  .state('inforesidencial', {
      url: '/inforesidencial',
      templateUrl: 'templates/inforesidencial.html',
      controller: 'InforesidencialCtrl'
  })

  .state('chat', {
      url: '/chat',
      templateUrl: 'templates/chat.html',
      controller: 'ChatCtrl'
  })

  .state('porteros', {
      url: '/porteros',
      templateUrl: 'templates/porteros.html',
      controller: 'PorterosCtrl'
  })

  .state('porteroscreate', {
      url: '/porteroscreate',
      templateUrl: 'templates/porteroscreate.html',
      controller: 'PorteroscreateCtrl'
  })

  .state('porterosbitacora', {
      url: '/porterosbitacora',
      templateUrl: 'templates/porterosbitacora.html',
      controller: 'PorterosbitacoraCtrl'
  })

  .state('reportesporteros', {
      url: '/reportesporteros',
      templateUrl: 'templates/reportesporteros.html',
      controller: 'ReportesporterosCtrl'
  })

  .state('reportesporterosshow', {
      url: '/reportesporterosshow',
      templateUrl: 'templates/reportesporterosshow.html',
      controller: 'ReportesporterosshowCtrl'
  })

  .state('reportesporteroscreate', {
      url: '/reportesporteroscreate',
      templateUrl: 'templates/reportesporteroscreate.html',
      controller: 'ReportesporteroscreateCtrl'
  })


  .state('personal', {
      url: '/personal',
      templateUrl: 'templates/personal.html',
      controller: 'PersonalCtrl'
  })

  .state('personalcreate', {
      url: '/personalcreate',
      templateUrl: 'templates/personalcreate.html',
      controller: 'PersonalcreateCtrl'
  })

  .state('personalbitacora', {
      url: '/personalbitacora',
      templateUrl: 'templates/personalbitacora.html',
      controller: 'PersonalbitacoraCtrl'
  })

  .state('reportespersonalcreate', {
      url: '/reportespersonalcreate',
      templateUrl: 'templates/reportespersonalcreate.html',
      controller: 'ReportespersonalcreateCtrl'
  })


  .state('encuestas', {
      url: '/encuestas',
      templateUrl: 'templates/encuestas.html',
      controller: 'EncuestasCtrl'
  })

  .state('encuestascreate', {
      url: '/encuestascreate',
      templateUrl: 'templates/encuestascreate.html',
      controller: 'EncuestascreateCtrl'
  })

  .state('encuestasedit', {
      url: '/encuestasedit',
      templateUrl: 'templates/encuestasedit.html',
      controller: 'EncuestaseditCtrl'
  })

  .state('encuestasshow', {
      url: '/encuestasshow',
      templateUrl: 'templates/encuestasshow.html',
      controller: 'EncuestasshowCtrl'
  })

  .state('encuestasresultados', {
      url: '/encuestasresultados',
      templateUrl: 'templates/encuestasresultados.html',
      controller: 'EncuestasresultadosCtrl'
  })

  .state('solicitudes', {
      url: '/solicitudes',
      templateUrl: 'templates/solicitudes.html',
      controller: 'SolicitudesCtrl'
  })

  .state('solicitudescalendario', {
      url: '/solicitudescalendario',
      templateUrl: 'templates/solicitudescalendario.html',
      controller: 'SolicitudescalendarioCtrl'
  })

  .state('solicitudescreate', {
      url: '/solicitudescreate',
      templateUrl: 'templates/solicitudescreate.html',
      controller: 'SolicitudescreateCtrl'
  })

  .state('solicitudesedit', {
      url: '/solicitudesedit',
      templateUrl: 'templates/solicitudesedit.html',
      controller: 'SolicitudeseditCtrl'
  })

  .state('propiedades', {
      url: '/propiedades',
      templateUrl: 'templates/propiedades.html',
      controller: 'PropiedadesCtrl'
  })

  .state('propiedadesedit', {
      url: '/propiedadesedit',
      templateUrl: 'templates/propiedadesedit.html',
      controller: 'PropiedadeseditCtrl'
  })

  .state('propiedadescreate', {
      url: '/propiedadescreate',
      templateUrl: 'templates/propiedadescreate.html',
      controller: 'PropiedadescreateCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

    .state('app.inicio', {
      url: '/inicio',
      views: {
        'menuContent': {
          templateUrl: 'templates/inicio.html',
          controller: 'InicioCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

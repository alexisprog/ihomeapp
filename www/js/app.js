
angular.module('starter', ['ionic', 
                           'LocalStorageModule',
                           'ngCordova', 
                           'jkAngularRatingStars', 
                           'angular-icheck', 
                           'pickadate',
                           'ionic-timepicker',
                           'ionic.service.core', 
                           'starter.controllers',
                           'angular-svg-round-progressbar',
                           'starter.routes',
                           'colorpicker.module',
                           'wysiwyg.module'])

.run(function($ionicPlatform, 
              localStorageService, 
              $rootScope, $auth, $http, $state, $ionicHistory, $ionicPopup, $ionicLoading) {

    $rootScope.ruta = 'http://ihomeapp.net/api/v1/';
    //$rootScope.ruta = 'http://localhost/ihome/public/api/v1/';

    // senderid 547636667025

   /* $ionicPlatform.registerBackButtonAction(function(){
      if($ionicHistory.currentStateName === 'app.inicio'){
        event.preventDefault();
      }else{
        $ionicHistory.goBack();
      }
    }, 100); */

    

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    //version nueva de onesignal

    // Set your iOS Settings
    var iosSettings = {};
    iosSettings["kOSSettingsKeyAutoPrompt"] = true;
    iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;

    var notificationOpenedCallback = function(jsonData) {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    };

    window.plugins.OneSignal
      .startInit("417d291e-a6f4-4724-bae6-575e37115fc6", "547636667025")
      .handleNotificationOpened(notificationOpenedCallback)
      .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
      .iOSSettings(iosSettings)
      .endInit();

     /*
      var notificationOpenedCallback = function(jsonData) {
        if (jsonData.additionalData && jsonData.additionalData.targetUrl) {
            var state = $injector.get($state);
            state.go(jsonData.additionalData.targetUrl);
        }
      }

      window.plugins.OneSignal.init("417d291e-a6f4-4724-bae6-575e37115fc6",
                                     {googleProjectNumber: "547636667025"},
                                      notificationOpenedCallback);
      */
      

      window.plugins.OneSignal.getIds(function(ids) {
        console.log('getIds: ' + JSON.stringify(ids));
        //alert("userId = " + ids.userId + ", pushToken = " + ids.pushToken);
        localStorageService.set('deviceToken', ids.userId);
        $rootScope.deviceToken = ids.userId;
      });

      
      $ionicPlatform.on('pause', function() {
        localStorageService.set('user', JSON.stringify($rootScope.User));
        localStorageService.set('deviceToken', $rootScope.deviceToken);
        localStorageService.set('inmueble_id', $rootScope.inmueble_id);
        localStorageService.set('inmueble_nombre', $rootScope.inmueble_nombre);
        localStorageService.set('inmueble_imagen', $rootScope.inmueble_imagen);
        if ($rootScope.User.roles_id == '3') {
          localStorageService.set('vecinos', JSON.stringify($rootScope.Vecinos));
        }       

        // opcionalmente puedes guardar la pagina donde se encuentra el usuario
        localStorageService.set('hash', document.location.hash);
      });

      $ionicPlatform.on('resume', function() {
        $rootScope.User = JSON.parse(localStorageService.get('user'));
        $rootScope.inmueble_id = localStorageService.get('inmueble_id');
        $rootScope.inmueble_nombre = localStorageService.get('inmueble_nombre');
        $rootScope.inmueble_imagen = localStorageService.get('inmueble_imagen');
        if ($rootScope.User.roles_id == '3') {
          $rootScope.Vecinos = JSON.parse(localStorageService.get('vecinos'));
        }
         // restauras el estado cuando fue cerrada la app.
         document.location.hash = localStorageService.get('hash');
      }); 

      
    
    
  });
  

  $rootScope.logout = function() {

    var confirmPopup = $ionicPopup.confirm({
     title: 'Cerrar App',
     template: '¿Esta seguro de cerrar sesion?',
     okText: '<i class="ion-checkmark-round"></i>',
     cancelText: '<i class="ion-close-round"></i>',
     cancelType: 'button-assertive',
     okType: 'button-energized',
   });

   confirmPopup.then(function(res) {
     if(res) {

       
      $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      
     
      $http.get($rootScope.ruta+'authenticate/limpiar/'+$rootScope.User.id)
          .success(function(response){
                 $ionicLoading.hide();
          })
          .error(function(response){
            $ionicLoading.hide();
              console.log(response);
          }); 

        
       $auth.logout().then(function() {
            
          localStorageService.set('logueado', false);
          localStorageService.remove('logueado');

          if ($rootScope.User.roles_id == '3') {
            localStorageService.remove('vecinos');
            $rootScope.vecinos = null;
          }
          
          localStorageService.remove('user');
          localStorageService.remove('inmueble_id');
          localStorageService.remove('inmueble_nombre');
          localStorageService.remove('inmueble_imagen');
          // Remove the current user info from rootscope
          $rootScope.User = null;
          $rootScope.deviceToken = null;
          $rootScope.inmueble_id = null;
          $rootScope.inmueble_nombre = null;
          $rootScope.inmueble_imagen = null;
          $ionicHistory.nextViewOptions({
                disableBack: true
              });
          $state.go('login');
      });
     } else {
       console.log('no cerrar');
     }
   });
 
      
      }
})


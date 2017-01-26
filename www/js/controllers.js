angular.module('starter.controllers', [])


.controller('LoginCtrl', function($scope, localStorageService, $ionicPopup, $ionicLoading, $ionicHistory, $http, $state, $auth, $rootScope) {
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  if(localStorageService.get('logueado')){
    
    $rootScope.User = JSON.parse(localStorageService.get('user'));
    $rootScope.inmueble_id = localStorageService.get('inmueble_id');
    $rootScope.inmueble_nombre = localStorageService.get('inmueble_nombre');
    $rootScope.inmueble_imagen = localStorageService.get('inmueble_imagen');
    if ($rootScope.User.roles_id == '3') {
      $rootScope.Vecinos = JSON.parse(localStorageService.get('vecinos'));
    }
    
    $ionicLoading.hide();

    $state.go('app.inicio'); //aqui la funcion que muestra el menu principal
  }

  $ionicLoading.hide();

  $rootScope.deviceToken = localStorageService.get('deviceToken');

  $scope.loginData = {}
  $scope.loginError = false;
  $scope.loginErrorText;

  $scope.login = function(){

      var credentials = {
                email: $scope.loginData.email,
                password: $scope.loginData.password,
                deviceToken: $rootScope.deviceToken
            }

      //console.log(credentials);

      $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

      $auth.login(credentials).then(function() {
                  
          // Return an $http request for the authenticated user
          //$http.get('http://ihomeapp.net/api/v1/authenticate/user')
          var ruta = $rootScope.ruta;
          $http.get(ruta+'authenticate/user')
          .success(function(response){
              // Stringify the retured data
              $ionicLoading.hide();
              if (response.user.status == '0' || response.user.roles_id == '1') {
                $ionicPopup.alert({
                  title: 'Inicio de Sesion',
                  content: 'Credenciales inactiva!!!',
                  okType: 'button-assertive',
                  okText: 'volver'
                });
              }else{

              localStorageService.set('logueado', true);
              var user = JSON.stringify(response.user);
              localStorageService.set('user', user);
              $rootScope.User = response.user;

              $ionicHistory.nextViewOptions({
                disableBack: true
              });


              if ($rootScope.User.inicio == '0') {
                $state.go('cambiarpassword');
              }else{
                $state.go('home');
              }


                
              }     
          })
          .error(function(){
              $ionicLoading.hide();
              $scope.loginError = true;
              $scope.loginErrorText = error.data.error;
              console.log($scope.loginErrorText);
          })
      }).catch(function (data) {
        $ionicLoading.hide();
        $ionicPopup.alert({
                  title: 'Inicio de Sesion',
                  content: 'Credenciales invalidas!!!',
                  okType: 'button-assertive',
                  okText: 'volver'
                });
      });
     
  }

})

.controller('ResetpasswordCtrl', function($scope, $ionicPopup, $ionicLoading, $ionicHistory, $http, $state, $rootScope) {

  $scope.data = {}
  
  $scope.add = function(){

      var datos = {
                email: $scope.data.email
            }

      $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

      $http.post($rootScope.ruta+'resetpassword', datos).success(function(response) {
          $ionicLoading.hide();
          
          $ionicPopup.alert({
            content: 'Su password fue restaurado con exito, consulte su email para iniciar sesion!!!',
            okType: 'button-assertive',
            okText: 'Ok'
          });

      }).error(function(response){
        $ionicLoading.hide();
          
          $ionicPopup.alert({
            content: 'El email no esta asociado a ninguna cuenta de iHome!!!',
            okType: 'button-assertive',
            okText: 'Ok'
          });
      });

      
     
  }

})

.controller('CambiarpasswordCtrl', function($scope, localStorageService, $auth, $ionicPopup, $ionicLoading, $ionicHistory, $http, $state, $rootScope) {

  $scope.data = {}
  
  $scope.add = function(){

      if ($scope.data.newpassword != $scope.data.reppassword) {

          $ionicPopup.alert({
            content: 'El nuevo password debe coincidir con el de verificacion!!!',
            okType: 'button-assertive',
            okText: 'Ok'
          });


      }else{


        var datos = {
                users_id: $rootScope.User.id,
                newpassword: $scope.data.newpassword
            }

        $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'cambiarpassword', datos).success(function(response) {
          $ionicLoading.hide();
          
          $ionicPopup.alert({
            content: 'Su password fue cambiado con exito!!!',
            okType: 'button-assertive',
            okText: 'Ok'
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
          $rootScope.inmueble_id = null;
          $ionicHistory.nextViewOptions({
                disableBack: true
              });
          $state.go('login');
      });

        }).error(function(response){
          $ionicLoading.hide();
            
            $ionicPopup.alert({
              content: 'Error intentelo mas tarde!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });
        });



      }

     
  }

})

.controller('HomeCtrl', function($scope, localStorageService, $state, $rootScope, $http, $ionicHistory, $ionicLoading) {

  //alert($rootScope.currentUser.id);
  $scope.inmuebles = [];
  var ruta = $rootScope.ruta;
  $http.get(ruta+'home/'+$rootScope.User.id)
          .success(function(response){
              // Stringify the retured data
              $ionicHistory.nextViewOptions({
                disableBack: true
              }); 

              $scope.inmuebles = response.inmuebles;
                           

                 
          })
          .error(function(response){
              console.log(response);
          });

  $scope.entrar = function(inmueble_id, nombre, imagen){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

    $rootScope.inmueble_id = inmueble_id;
    $rootScope.inmueble_nombre = nombre;
    $rootScope.inmueble_imagen = imagen;
    
    localStorageService.set('inmueble_id', inmueble_id);
    localStorageService.set('inmueble_nombre', nombre); 
    localStorageService.set('inmueble_imagen', imagen); 

    if ($rootScope.User.roles_id == '3') {

      $http.get($rootScope.ruta+'home/vecinos/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
          .success(function(response){
              
              var vecinos = JSON.stringify(response.vecinos[0]);
              localStorageService.set('vecinos', vecinos);  
              $rootScope.Vecinos = response.vecinos[0];
              console.log($rootScope.Vecinos);

              $ionicLoading.hide();

              $state.go('app.inicio');
                 
          })
          .error(function(response){
              $ionicLoading.hide();
              alert('Error al seleccionar datos de usuario, intente de nuevo');
              console.log(response);
          });

      
    }else{
      $rootScope.Vecinos = [];
    }

    $ionicLoading.hide();

    
    //alert($rootScope.inmueble_id);

    $state.go('app.inicio');

  }

 
})

.controller('AppCtrl', function($scope, localStorageService, $state, $rootScope, $http, $ionicLoading, $ionicHistory) {

  $ionicHistory.clearHistory();
  $ionicHistory.clearCache();

  $scope.inicio = function(){
    $state.go('app.inicio');
  }

  $scope.perfil = function(){
    $state.go('vecinosperfil');
  }

  $scope.cambiarpassword = function(){
    $state.go('cambiarpassword');
  }

  $scope.cambiaredificio = function(){
    $state.go('home');
  }


  $scope.reportes = function(){
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.reportesdanos = [];  
  $http.get($rootScope.ruta+'reportesdanos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.reportesdanos = response.reportesdanos; 
          $state.go('reportes');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.noticias = function(){
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.noticiaslist = []; 
  $rootScope.noticiasvecinoslist = [];  
  $http.get($rootScope.ruta+'noticias/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.noticiaslist = response.noticias; 
          $rootScope.noticiasvecinoslist = response.noticiasvecinos; 
          $state.go('noticias');
          
      })
      .error(function(response){
           $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.pagos = function(){
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.pagoslist = [];  
  $http.get($rootScope.ruta+'pagos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.pagoslist = response.pagos; 
          $state.go('pagos');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.vecinos = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.vecinoslist = [];  
  $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.vecinoslist = response.vecinos; 
          $state.go('vecinos');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.servicios = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.servicioslist = [];  
    $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.servicioslist = response.servicios; 
            $state.go('servicios');
            
        })
        .error(function(response){
            $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.inforesidencial = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.infolist = [];  
  $http.get($rootScope.ruta+'informes/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.infolist = response.informes; 
          $state.go('inforesidencial');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.administracion = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.chatlist = [];  
  $http.get($rootScope.ruta+'chat/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.chatlist = response.chats; 
          $state.go('chat');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.porteros = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    if ($rootScope.User.roles_id == 2) {
        $rootScope.porteroslist = [];  
          $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
              .success(function(response){
                  //console.log(response);

                  $ionicLoading.hide();
                  $rootScope.porteroslist = response.porteros; 
                  $state.go('porteros');
                  
              })
              .error(function(response){
                $ionicLoading.hide();
                  console.log(response);
              });

    }else if ($rootScope.User.roles_id == 3){
        $rootScope.reportesporteroslist = [];  
          $http.get($rootScope.ruta+'reportesporteros/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id+'/'+$rootScope.Vecinos.id)
              .success(function(response){
                  //console.log(response);

                  $ionicLoading.hide();
                  $rootScope.reportesporteroslist = response.reportesporteros; 
                  $state.go('reportesporteros');
                  
              })
              .error(function(response){
                $ionicLoading.hide();
                  console.log(response);
              });

      }else if ($rootScope.User.roles_id == 4){
      $rootScope.vecinoslist = [];  
      $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.vecinoslist = response.vecinos;  
            $state.go('reportesporteroscreate');
                
            })
            .error(function(response){
              $ionicLoading.hide();
                console.log(response);
            });

    }
  }



  $scope.personal = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  if ($rootScope.User.roles_id == 2) {
      $rootScope.personallist = [];  
        $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
            .success(function(response){
              $ionicLoading.hide();
                //console.log(response);
                $rootScope.personallist = response.personal; 
                $state.go('personal');
                
            })
            .error(function(response){
              $ionicLoading.hide();
                console.log(response);
            });

  }else{
      $ionicLoading.hide();
        $state.go('reportespersonalcreate');
    }
  }


  $scope.encuestas = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
          $ionicLoading.hide();
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            
            $state.go('encuestas');
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.solicitudes = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.solicitudeslist = [];  
    $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
          $ionicLoading.hide();
            //console.log(response);
            $rootScope.solicitudeslist = response.solicitudes; 
            
            $state.go('solicitudes');
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.mipropiedad = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.propiedadeslist = [];  
    $http.get($rootScope.ruta+'propiedades/index/'+$rootScope.Vecinos.id)
        .success(function(response){
          $ionicLoading.hide();
            //console.log(response);
            if(response.propiedades.length == 0){
              $state.go('propiedadescreate');
            }else{
              $rootScope.propiedadeslist = response.propiedades[0];
              $state.go('propiedades');
            }
            
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

 
})

.controller('InicioCtrl', function($scope, localStorageService, $state, $rootScope, $http, $ionicHistory, $ionicLoading) {
  $ionicHistory.clearHistory();
  $ionicHistory.clearCache();

  var timeout = setTimeout(reload, 1000);

  $scope.alertreportes = 0;
  $scope.alertpagos = 0;
  $scope.alertnoticias = 0;
  $scope.alertencuetas = 0;
  $scope.alertsolicitudes = 0;
  $scope.alertinfo = 0;
  $scope.alertporteria = 0;
  $scope.alertchat = 0;
  $scope.alertservicios = 0;

  function reload () {

      var ird = 0;
      var not = 0;
      var pag = 0;
      var enc = 0;
      var sol = 0;
      var inf = 0;
      var por = 0;
      var chat = 0;
      var ser = 0;

      $http.get($rootScope.ruta+'alertas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);    
           angular.forEach(response.alertas, function(aler, key) {                  
                  if (aler.alerta == 'Reporte daños') {
                    ird = ird + 1;
                  }else if(aler.alerta == 'Noticias'){
                    not = not + 1;
                  }else if(aler.alerta == 'Pagos'){
                    pag = pag + 1;
                  }else if(aler.alerta == 'Encuestas'){
                    enc = enc + 1;
                  }else if(aler.alerta == 'Solicitudes'){
                    sol = sol + 1;
                  }else if(aler.alerta == 'Informes'){
                    inf = inf + 1;
                  }else if(aler.alerta == 'Porteria'){
                    por = por + 1;
                  }else if(aler.alerta == 'Chat'){
                    chat = chat + 1;
                  }else if(aler.alerta == 'Servicios'){
                    ser = ser + 1;
                  }
          });    

                if(ird > 0){
                  $scope.alertreportes = ird;
                }
                if(not > 0){
                  $scope.alertnoticias = not;
                }
                if(pag > 0){
                  $scope.alertpagos = pag;
                }
                if(enc > 0){
                  $scope.alertencuetas = enc;
                }
                if(sol > 0){
                  $scope.alertsolicitudes = sol;
                }
                if(inf > 0){
                  $scope.alertinfo = inf;
                }
                if(por > 0){
                  $scope.alertporteria = por;
                }
                if(chat > 0){
                  $scope.alertchat = chat;
                }
                if(ser > 0){
                  $scope.alertservicios = ser;
                }  

      })
      .error(function(response){
          console.log(response);
      });
      
        timeout = setTimeout(reload, 3000);
      }

  $scope.inicio = function(){
    $state.go('app.inicio');
  }

  $scope.reportes = function(){
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.reportesdanos = [];  
  $http.get($rootScope.ruta+'reportesdanos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.reportesdanos = response.reportesdanos; 
          $state.go('reportes');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.noticias = function(){
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.noticiaslist = []; 
  $rootScope.noticiasvecinoslist = []; 
  $http.get($rootScope.ruta+'noticias/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.noticiaslist = response.noticias; 
          $rootScope.noticiasvecinoslist = response.noticiasvecinos;
          $state.go('noticias');
          
      })
      .error(function(response){
           $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.pagos = function(){
  $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.pagoslist = [];  
  $http.get($rootScope.ruta+'pagos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.pagoslist = response.pagos; 
          $state.go('pagos');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.vecinos = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.vecinoslist = [];  
  $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.vecinoslist = response.vecinos; 
          $state.go('vecinos');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.servicios = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.servicioslist = [];  
    $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.servicioslist = response.servicios; 
            $state.go('servicios');
            
        })
        .error(function(response){
            $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.inforesidencial = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.infolist = [];  
  $http.get($rootScope.ruta+'informes/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.infolist = response.informes; 
          $state.go('inforesidencial');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.administracion = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.chatlist = [];  
  $http.get($rootScope.ruta+'chat/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $ionicLoading.hide();
          $rootScope.chatlist = response.chats; 
          $state.go('chat');
          
      })
      .error(function(response){
          $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.porteros = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    if ($rootScope.User.roles_id == 2) {
        $rootScope.porteroslist = [];  
          $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
              .success(function(response){
                  //console.log(response);

                  $ionicLoading.hide();
                  $rootScope.porteroslist = response.porteros; 
                  $state.go('porteros');
                  
              })
              .error(function(response){
                $ionicLoading.hide();
                  console.log(response);
              });

    }else if ($rootScope.User.roles_id == 3){
        $rootScope.reportesporteroslist = [];  
          $http.get($rootScope.ruta+'reportesporteros/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id+'/'+$rootScope.Vecinos.id)
              .success(function(response){
                  //console.log(response);

                  $ionicLoading.hide();
                  $rootScope.reportesporteroslist = response.reportesporteros; 
                  $state.go('reportesporteros');
                  
              })
              .error(function(response){
                $ionicLoading.hide();
                  console.log(response);
              });

      }else if ($rootScope.User.roles_id == 4){
      $rootScope.vecinoslist = [];  
      $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.vecinoslist = response.vecinos;  
            $state.go('reportesporteroscreate');
                
            })
            .error(function(response){
              $ionicLoading.hide();
                console.log(response);
            });

    }
  }



  $scope.personal = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  if ($rootScope.User.roles_id == 2) {
      $rootScope.personallist = [];  
        $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
            .success(function(response){
              $ionicLoading.hide();
                //console.log(response);
                $rootScope.personallist = response.personal; 
                $state.go('personal');
                
            })
            .error(function(response){
              $ionicLoading.hide();
                console.log(response);
            });

  }else{
      $ionicLoading.hide();
        $state.go('reportespersonalcreate');
    }
  }


  $scope.encuestas = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
          $ionicLoading.hide();
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            
            $state.go('encuestas');
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.solicitudes = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.solicitudeslist = [];  
    $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
          $ionicLoading.hide();
            //console.log(response);
            $rootScope.solicitudeslist = response.solicitudes; 
            
            $state.go('solicitudes');
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.mipropiedad = function(){
    $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.propiedadeslist = [];  
    $http.get($rootScope.ruta+'propiedades/index/'+$rootScope.Vecinos.id)
        .success(function(response){
          $ionicLoading.hide();
            //console.log(response);
            if(response.propiedades.length == 0){
              $state.go('propiedadescreate');
            }else{
              $rootScope.propiedadeslist = response.propiedades[0];
              $state.go('propiedades');
            }
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }
 
})

// controlador reportes

.controller('ReportescreateCtrl', function($scope, $ionicPopup, $state, $rootScope, $http, $cordovaCamera, $cordovaFileTransfer, $ionicLoading) {
  $scope.data = {}
  $scope.photo = 'public/dist/img/300x300.png';
  $rootScope.imagen = 'sinimagen.png';

  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $rootScope.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'public/dist/img/300x300.png';
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

    


  };



  $scope.reportes = function(){

    $rootScope.reportesdanos = [];  
    $http.get($rootScope.ruta+'reportesdanos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.reportesdanos = response.reportesdanos; 
            $state.go('reportes');
            
        })
        .error(function(response){
            console.log(response);
        });

  }

  $scope.add = function(){     
     var datos = {
                users_id: $rootScope.User.id,
                inmueble_id: $rootScope.inmueble_id,
                titulo: $scope.data.titulo,
                descripcion: $scope.data.descripcion,
                imagen: $rootScope.imagen
            }

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'reportesdanos', datos).success(function(response) {
          
          $ionicLoading.hide();

        }).error(function(response){
          $ionicLoading.hide();
          console.log(response);
        });

        $ionicPopup.alert({
            content: 'Reporte de Daño, enviado con exito!!!',
            okType: 'button-assertive',
            okText: 'Ok'
          });

        $http.get($rootScope.ruta+'reportesdanos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.reportesdanos = response.reportesdanos; 
                $state.go('reportes');
                
            })
            .error(function(response){
                console.log(response);
            });
  }

 
  

})

.controller('ReporteseditCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  $scope.addResp = function(respuesta, reportes_id){

      var datos = {
                users_id: $rootScope.User.id,
                reportes_id: reportes_id,
                respuesta: respuesta
            }

    $http.post($rootScope.ruta+'respuestasrds', datos).success(function(response) {

          $ionicPopup.alert({
                  title: 'Respuesta',
                  content: 'Respuesta enviada con exito!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });

          console.log(response.respuestas);
          $rootScope.respuestasedit = response.respuestas; 

        }).error(function(response){
          console.log(response);
        });


  }


  $scope.reportes = function(){

  $rootScope.reportesdanos = [];  
  $http.get($rootScope.ruta+'reportesdanos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.reportesdanos = response.reportesdanos; 
          $state.go('reportes');
          
      })
      .error(function(response){
          console.log(response);
      });

  }

})

.controller('ReportesCtrl', function($scope, $state, $rootScope, $http, $ionicLoading) {

  $scope.reportes = [];
  $scope.reportes = $rootScope.reportesdanos;

  $scope.reportesedit = function($id){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  
  $http.get($rootScope.ruta+'reportesdanos/edit/'+$id)
      .success(function(response){
          //console.log(response);
          $rootScope.reportesdanos2 = response.reportesdanos;
          $rootScope.respuestasedit = response.respuestas; 

          $ionicLoading.hide();
          $state.go('reportesedit');
          
      })
      .error(function(response){
        $ionicLoading.hide();
          console.log(response);
      });

  }

})

//fin de reportes

//noticias

.controller('NoticiasCtrl', function($scope, $state, $rootScope, $http, $ionicLoading) {

  $scope.noticiasedit = function($id){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

  $http.get($rootScope.ruta+'noticias/edit/'+$rootScope.User.id+'/'+$id)
      .success(function(response){
          //console.log(response);
          $rootScope.noticias2 = response.noticias; 
          $ionicLoading.hide();
          $state.go('noticiasedit');
          
      })
      .error(function(response){
        $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.noticiasshow = function($id){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

  $http.get($rootScope.ruta+'noticias/show/'+$rootScope.User.id+'/'+$id)
      .success(function(response){
          //console.log(response);
          $rootScope.noticias2 = response.noticias; 
          $ionicLoading.hide();
          $state.go('noticiasshow');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})

.controller('NoticiasshowCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  $scope.noticias = function(){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

  $rootScope.noticiaslist = [];  
  $rootScope.noticiasvecinoslist = [];
  $http.get($rootScope.ruta+'noticias/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.noticiaslist = response.noticias; 
          $rootScope.noticiasvecinoslist = response.noticiasvecinos; 
          $ionicLoading.hide();
          $state.go('noticias');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})

.controller('NoticiascreateCtrl', function($scope, $ionicPopup, $state, $rootScope, $http, $cordovaCamera, $cordovaFileTransfer, $ionicLoading) {
  
  $scope.menu = [
            ['bold', 'italic', 'underline'],
            ['left-justify', 'center-justify', 'right-justify']
        ];



  $scope.data = {}
  $scope.photo = 'public/dist/img/300x300.png';
  $rootScope.imagen = 'sinimagen.png';

  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $rootScope.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'public/dist/img/300x300.png';
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){

      console.log(error);
    });

  };


  $scope.noticias = function(){

  $rootScope.noticiaslist = [];  
  $rootScope.noticiasvecinoslist = [];
  $http.get($rootScope.ruta+'noticias/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.noticiaslist = response.noticias;
          $rootScope.noticiasvecinoslist = response.noticiasvecinos; 
          $state.go('noticias');
          
      })
      .error(function(response){
          console.log(response);
      });

  }


  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                titulo: $scope.data.titulo,
                descripcion: $scope.data.descripcion,
                imagen: $rootScope.imagen
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'noticias', datos).success(function(response) {
            $ionicLoading.hide();
        }).error(function(response){
           $ionicLoading.hide();
          console.log(response);
        });

        $ionicPopup.alert({
            content: 'Noticia, enviada con exito!!!',
            okType: 'button-assertive',
            okText: 'Ok'
          });
         
      $http.get($rootScope.ruta+'noticias/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.noticiaslist = response.noticias; 
          $rootScope.noticiasvecinoslist = response.noticiasvecinos;
          $state.go('noticias');
          
      })
      .error(function(response){
          console.log(response);
      });
  }

 
  

})


//fin noticias

// pagos

.controller('PagosCtrl', function($scope, $state, $rootScope, $http, $ionicLoading) {

  $scope.pagosshow = function($id){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

    $http.get($rootScope.ruta+'pagos/show/'+$id)
        .success(function(response){
            //console.log(response);
            $rootScope.pagos2 = response.pagos; 
            $rootScope.pagosvecinoslist = response.pagosvecinos;
            $ionicLoading.hide();
            $state.go('pagosshow');          
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

    }

  $scope.pagoscreate = function(){

 

  $http.get($rootScope.ruta+'pagos/create/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response); 
          $rootScope.vecinoslist = response.vecinos; 
          $state.go('pagoscreate');          
      })
      .error(function(response){
          console.log(response);
      });

  }

})

.controller('PagosshowCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  $scope.pagos = function(){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

  $rootScope.pagoslist = [];  
  $http.get($rootScope.ruta+'pagos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.pagoslist = response.pagos; 
          $ionicLoading.hide();
          $state.go('pagos');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

  $scope.pagar = function(id){


         var confirmPopup = $ionicPopup.confirm({
           title: 'Confirmar Pago',
           template: 'Esta seguro de confirmar este pago?'
         });

         confirmPopup.then(function(res) {
           if(res) {

            var datos = {
                id: id,
                status: '1'
            }

            $http.post($rootScope.ruta+'pagos/update', datos).success(function(response) {
              console.log(response);

              $scope.pagos();


            }).error(function(response){
              console.log(response);
            });
            
             
           } else {
             console.log(res);
           }
         });


  }

})

.controller('PagoscreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup) {

  $scope.pagos = function(){

  $rootScope.pagoslist = [];  
  $http.get($rootScope.ruta+'pagos/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.pagoslist = response.pagos; 
          $state.go('pagos');
          
      })
      .error(function(response){
          console.log(response);
      });

  }

  $scope.vecinos = function(){

  $rootScope.vecinoslist = [];  
  $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.vecinoslist = response.vecinos; 
          $state.go('vecinos');
          
      })
      .error(function(response){
          console.log(response);
      });

  }

})

//fin pagos

// vecinos

.controller('VecinosCtrl', function($scope, $state, $rootScope, $http) {


})

.controller('VecinoscreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $scope.data = {}

  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                name: $scope.data.name,
                cedula: $scope.data.cedula,
                email: $scope.data.email,
                apartamento: $scope.data.apartamento,
                telefono: $scope.data.telefono,
                profesion: $scope.data.profesion
            }

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'vecinos', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Vecino, registrado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.vecinoslist = response.vecinos; 
                $state.go('vecinos');
                
            })
            .error(function(response){
                console.log(response);
            });
          
        }).error(function(response){
           $ionicLoading.hide();
          console.log(response);
          $ionicPopup.alert({
                content: 'Email en uso, intente con otro!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.vecinos = function(){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.vecinoslist = [];  
  $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.vecinoslist = response.vecinos; 
          $ionicLoading.hide();
          $state.go('vecinos');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})

.controller('VecinosperfilCtrl', function($scope, localStorageService, $state, $rootScope, $http, $ionicPopup, $cordovaCamera, $cordovaFileTransfer, $ionicLoading) {
  $scope.data = {}

  $scope.data.name = $rootScope.Vecinos.usuarios.name;
  $scope.data.cedula = parseInt($rootScope.Vecinos.cedula);
  $scope.data.email = $rootScope.Vecinos.usuarios.email;
  $scope.data.apartamento = $rootScope.Vecinos.apartamento;
  $scope.data.telefono = $rootScope.Vecinos.telefono;
  $scope.data.profesion = $rootScope.Vecinos.profesion;
  if ($rootScope.Vecinos.notificacion_email == '1') {
    $scope.data.notificacion_email = true;
  }else{
    $scope.data.notificacion_email = false;
  }
  if ($rootScope.Vecinos.notificacion_push == '1') {
    $scope.data.notificacion_push = true;
  }else{
    $scope.data.notificacion_push = false;
  }
  if ($rootScope.Vecinos.mostrar_info == '1') {
    $scope.data.mostrar_info = true;
  }else{
    $scope.data.mostrar_info = false;
  }
  
  $scope.data.imagen = $rootScope.Vecinos.imagen;

  $scope.photo = 'http://ihomeapp.net/imagenes/'+$rootScope.Vecinos.imagen;



  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $scope.data.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'http://ihomeapp.net/imagenes/'+$rootScope.Vecinos.imagen;
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

  };





  $scope.add = function(){ 

    var noti_email = '1';
    var noti_push = '1';
    var info_vecinos = '1';
    if ($scope.data.notificacion_email == true) {
        noti_email = '1';
    }else{
        noti_email = '0';
    }
    if ($scope.data.notificacion_push == true) {
        noti_push = '1';
    }else{
        noti_push = '0';
    } 
    if ($scope.data.mostrar_info == true) {
        info_vecinos = '1';
    }else{
        info_vecinos = '0';
    } 

     var datos = {
                vecinos_id: $rootScope.Vecinos.id,
                name: $scope.data.name,
                cedula: $scope.data.cedula,
                email: $scope.data.email,
                apartamento: $scope.data.apartamento,
                telefono: $scope.data.telefono,
                profesion: $scope.data.profesion,
                imagen: $scope.data.imagen,
                notificacion_email: noti_email,
                notificacion_push: noti_push,
                mostrar_info: info_vecinos
            }

           $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.put($rootScope.ruta+'vecinos', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Perfil actualizado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            var vecinos = JSON.stringify(response.vecinos[0]);
            localStorageService.set('vecinos', vecinos);  
            $rootScope.Vecinos = response.vecinos[0];

            $state.go('app.inicio');
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Error al actualizar el perfil, intentelo de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.vecinos = function(){

    $rootScope.vecinoslist = [];  
    $http.get($rootScope.ruta+'vecinos/index/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.vecinoslist = response.vecinos; 
            $state.go('vecinos');
            
        })
        .error(function(response){
            console.log(response);
        });

  }

})

// fin vecinos

// servicios

.controller('ServiciosCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  $scope.serviciosshow = function($id){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $http.get($rootScope.ruta+'servicios/show/'+$id)
        .success(function(response){
            //console.log(response);
            $rootScope.servicio2 = response.servicios; 
            $rootScope.respuestaslist = response.respuestas; 
            $ionicLoading.hide();
            $state.go('serviciosshow');          
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.serviciosedit = function($id){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $http.get($rootScope.ruta+'servicios/edit/'+$rootScope.User.id+'/'+$id)
        .success(function(response){
            //console.log(response);
            $rootScope.servicio2 = response.servicios; 
            $rootScope.inte = response.inte; 
            $ionicLoading.hide();
            $state.go('serviciosedit');          
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }



})

.controller('ServiciosshowCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  $scope.addResp = function(respuesta, servicios_id){

      var datos = {
                users_id: $rootScope.User.id,
                inmueble_id: $rootScope.inmueble_id,
                servicios_id: servicios_id,
                respuesta: respuesta
            }

           $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

    $http.post($rootScope.ruta+'respservicios', datos).success(function(response) {
      $ionicLoading.hide();
          $ionicPopup.alert({
                  title: 'Respuesta',
                  content: 'Respuesta enviada con exito!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });

          console.log(response.respuestas);
          $rootScope.respuestaslist = response.respuestas; 

        }).error(function(response){
           $ionicLoading.hide();
          console.log(response);
        });


  }

  $scope.servicios = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.servicioslist = [];  
    $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.servicioslist = response.servicios; 
            $ionicLoading.hide();
            $state.go('servicios');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

})

.controller('ServicioseditCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $scope.data = {}
  $scope.add = function(){

      var datos = {
                users_id: $rootScope.User.id,
                inmuebles_id: $rootScope.inmueble_id,
                servicios_id: $rootScope.servicio2.id,
                informacion: $scope.data.informacion
            }

           $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

    $http.post($rootScope.ruta+'interesadosservicios', datos).success(function(response) {
          
          $ionicPopup.alert({
                  title: 'Interesado',
                  content: 'Respuesta enviada con exito!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });

          $rootScope.servicioslist = [];  
          $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
              .success(function(response){
                  //console.log(response);
                  $rootScope.servicioslist = response.servicios; 
                  $ionicLoading.hide();
                  $state.go('servicios');
                  
              })
              .error(function(response){
                 $ionicLoading.hide();
                  console.log(response);
              });

        }).error(function(response){
           $ionicLoading.hide();
          console.log(response);
        });


  }

  $scope.servicios = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.servicioslist = [];  
    $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.servicioslist = response.servicios; 
            $ionicLoading.hide();
            $state.go('servicios');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

})


.controller('ServicioscreateCtrl', function($scope, $ionicPopup, $state, $rootScope, $http, $cordovaCamera, $cordovaFileTransfer, $ionicLoading) {

  $scope.data = {}
  $scope.photo = 'public/dist/img/300x300.png';
  $rootScope.imagen = 'sinimagen.png';

  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $rootScope.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'public/dist/img/300x300.png';
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

    


  };

  $scope.servicios = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.servicioslist = [];  
    $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.servicioslist = response.servicios; 
            $ionicLoading.hide();
            $state.go('servicios');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.add = function(){     
     var datos = {
                users_id: $rootScope.User.id,
                inmueble_id: $rootScope.inmueble_id,
                titulo: $scope.data.titulo,
                descripcion: $scope.data.descripcion,
                imagen: $rootScope.imagen
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
        $http.post($rootScope.ruta+'servicios', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Servicio, enviado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $http.get($rootScope.ruta+'servicios/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.servicioslist = response.servicios; 
                $state.go('servicios');
                
            })
            .error(function(response){
                console.log(response);
            });
        

        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
              content: 'Error!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });
        });

        

        
  }

})
// fin servicios

// info residencial
.controller('InforesidencialCtrl', function($scope, $cordovaInAppBrowser, $cordovaProgress, $cordovaFileOpener2, $ionicLoading, $ionicPopup, $state, $rootScope, $http, $cordovaFileTransfer) {

  $scope.Download = function (archivo) {
     var url = "http://ihomeapp.net/imagenes/"+archivo;
     var filename = url.split("/").pop();
     var targetPath = cordova.file.externalRootDirectory + 'Download/' + filename;

     var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'yes'
    };

      $ionicLoading.show({
          template: 'descargando...'
      });

      $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
            $ionicLoading.hide();
            $cordovaInAppBrowser.open(targetPath, '_black', options)
            .then(function(event) {
              // success
            })
            .catch(function(event) {
              alert('error: '+event);
            });

      }, function (error) {
          $ionicLoading.hide();
          $ionicPopup.alert({
                  title: 'Download',
                  content: 'Error Download file',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });
      }, function (progress) {
          var downloadProgress = (progress.loaded / progress.total) * 100;
          $ionicLoading.show({
              template: "Progreso：" + Math.floor(downloadProgress) + "%"
          });
          if (downloadProgress >= 100) {
              $ionicLoading.hide();
          }
      });
  }
  

})
// fin info residencial

// chat admin
.controller('ChatCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  
  $scope.addResp = function(mensaje){

      var datos = {
                users_id: $rootScope.User.id,
                inmuebles_id: $rootScope.inmueble_id,
                mensaje: mensaje
            }

       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

    $http.post($rootScope.ruta+'chat', datos).success(function(response) {
        $ionicLoading.hide();
          $ionicPopup.alert({
                  title: 'Respuesta',
                  content: 'Respuesta enviada con exito!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });
          $rootScope.chatlist = response.chats; 

        }).error(function(response){
           $ionicLoading.hide();
          console.log(response);
        });


  }

})
// fin chat admin

// porteros
.controller('PorterosCtrl', function($scope, $state, $rootScope, $http, $ionicLoading) {

  $scope.porterosbitacora = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.reportesporteroslist = [];  
  $http.get($rootScope.ruta+'porteros/index2')
      .success(function(response){
          //console.log(response);
          $rootScope.reportesporteroslist = response.reportesporteros; 
          $ionicLoading.hide();
          $state.go('porterosbitacora');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})

.controller('PorteroscreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $scope.data = {}

  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                name: $scope.data.name,
                cedula: $scope.data.cedula,
                email: $scope.data.email
            }

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'porteros', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Portero, registrado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.porteroslist = response.porteros; 
                $state.go('porteros');
                
            })
            .error(function(response){
                console.log(response);
            });
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Email en uso, intente con otro!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.porteros = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.porteroslist = [];  
  $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.porteroslist = response.porteros;
          $ionicLoading.hide(); 
          $state.go('porteros');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }



})

.controller('PorterosbitacoraCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $scope.data = {}

  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                email: $scope.data.email
            }

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'porteros/email', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Email, enviado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.porteroslist = response.porteros; 
                $state.go('porteros');
                
            })
            .error(function(response){
                console.log(response);
            });
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Email no se envio, intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.porteros = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.porteroslist = [];  
  $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.porteroslist = response.porteros; 
          $ionicLoading.hide();
          $state.go('porteros');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})
// fin porteros

// reportes porteros
.controller('ReportesporterosCtrl', function($scope, $state, $rootScope, $http, $ionicLoading) {

  $scope.reportesporterosshow = function($id){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.reportesporteros2list = [];
  $rootScope.respuestasedit = [];
  $http.get($rootScope.ruta+'reportesporteros/show/'+$id+'/'+$rootScope.User.id)
      .success(function(response){
          //console.log(response);
          $rootScope.reportesporteros2list = response.reportesporteros2[0]; 
          $rootScope.respuestasedit = response.respuestas; 
          $ionicLoading.hide();
          $state.go('reportesporterosshow');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }
  

})

.controller('ReportesporterosshowCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

  $scope.addResp = function(respuesta, reportes_id){

      var datos = {
                users_id: $rootScope.User.id,
                reportes_id: reportes_id,
                respuesta: respuesta
            }

       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
        
    $http.post($rootScope.ruta+'respuestasrps', datos).success(function(response) {
          $ionicLoading.hide();
          $ionicPopup.alert({
                  title: 'Respuesta',
                  content: 'Respuesta enviada con exito!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });

          $rootScope.respuestasedit = response.respuestas; 

        }).error(function(response){
           $ionicLoading.hide();
          console.log(response);
        });


  }



  $scope.porteros = function(){
  if ($rootScope.User.roles_id == 2) {
      $rootScope.porteroslist = [];  
        $http.get($rootScope.ruta+'porteros/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.porteroslist = response.porteros; 
                $state.go('porteros');
                
            })
            .error(function(response){
                console.log(response);
            });

  }else if ($rootScope.User.roles_id == 3){
        $rootScope.reportesporteroslist = [];  
        $http.get($rootScope.ruta+'reportesporteros/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id+'/'+$rootScope.Vecinos.id)
            .success(function(response){
                //console.log(response);
                $rootScope.reportesporteroslist = response.reportesporteros; 
                $state.go('reportesporteros');
                
            })
            .error(function(response){
                console.log(response);
            });

    }else if ($rootScope.User.roles_id == 4){
        $rootScope.reportesporteroslist = [];  
        $http.get($rootScope.ruta+'reportesporteros/index2/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.reportesporteroslist = response.reportesporteros; 
                $state.go('reportesporteros');
                
            })
            .error(function(response){
                console.log(response);
            });

    }
  }
  

})

.controller('ReportesporteroscreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaFileTransfer) {

  $scope.data = {}
  $scope.photo = 'public/dist/img/300x300.png';
  $scope.categoria = 'recibos';
  $scope.cambio = function(cate){
    $scope.categoria = cate;
  }

  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $scope.data.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'public/dist/img/300x300.png';
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

  };

  $scope.data.subcategoria = 'n/a';
  $scope.add = function(){     
     var datos = {
                vecinos_id: $scope.data.vecinos_id,
                porteros_id: $rootScope.User.id,
                categoria: $scope.categoria,
                subcategoria: $scope.data.subcategoria,
                imagen: $scope.data.imagen,
                descripcion: $scope.descripcion,
                status: '1',
                statusvecino: '0'
            }


         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'reportesporteros', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Reporte de Porteria, registrado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $rootScope.reportesporteroslist = [];  
        $http.get($rootScope.ruta+'reportesporteros/index2/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.reportesporteroslist = response.reportesporteros; 
                $state.go('reportesporteros');
                
            })
            .error(function(response){
                console.log(response);
            });

            
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Error, intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }


  $scope.reportesporteros = function(){
        $rootScope.reportesporteroslist = [];  
        $http.get($rootScope.ruta+'reportesporteros/index2/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.reportesporteroslist = response.reportesporteros; 
                $state.go('reportesporteros');
                
            })
            .error(function(response){
                console.log(response);
            });
  }
  

})
// fin reportes porteros

// personal planta

.controller('PersonalCtrl', function($scope, $state, $rootScope, $http, $ionicLoading) {

  $scope.personalbitacora = function(){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

  $rootScope.reportespersonallist = [];  
  $http.get($rootScope.ruta+'personal/index2')
      .success(function(response){
          //console.log(response);
          $rootScope.reportespersonallist = response.reportespersonal; 
          $ionicLoading.hide();
          $state.go('personalbitacora');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})

.controller('PersonalcreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaFileTransfer) {
  $scope.data = {}
  $scope.photo = 'img/userprofile.png';

  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $scope.data.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'img/userprofile.png';
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

  };

  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                name: $scope.data.name,
                cedula: $scope.data.cedula,
                departamento: $scope.data.departamento,
                imagen: $scope.data.imagen
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'personal', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Personal de Planta, registrado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.personallist = response.personal; 
                $state.go('personal');
                
            })
            .error(function(response){
                console.log(response);
            });
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Cedula en uso, intente con otra!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.personal = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.personallist = [];  
  $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.personallist = response.personal; 
          $ionicLoading.hide();
          $state.go('personal');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }



})

.controller('PersonalbitacoraCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $scope.data = {}

  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                email: $scope.data.email
            }

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'personal/email', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Email, enviado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.personallist = response.personal; 
                $state.go('personal');
                
            })
            .error(function(response){
                console.log(response);
            });
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Email no se envio, intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.personal = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
  $rootScope.personallist = [];  
  $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
      .success(function(response){
          //console.log(response);
          $rootScope.personallist = response.personal; 
          $ionicLoading.hide();
          $state.go('personal');
          
      })
      .error(function(response){
         $ionicLoading.hide();
          console.log(response);
      });

  }

})


.controller('ReportespersonalcreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading, $cordovaCamera, $cordovaFileTransfer) {

  $scope.data = {}
  $scope.photo = 'public/dist/img/300x300.png';
  $scope.tipo = 'aseo';
  $scope.accion = 'entrando';
  $scope.cambio = function(tipo){
    $scope.tipo = tipo;
  }
  $scope.cambio2 = function(accion){
    $scope.accion = accion;
  }

  $scope.getPhoto = function(source){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        targetWidth: 300,
        targetHeight: 300,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            $ionicLoading.hide();
            $scope.data.imagen = result.response;
            $scope.photo = imageData;
        }, function(err) {
            $ionicLoading.hide();
            console.log("ERROR: " + JSON.stringify(err));
            alert('Error!! '+ JSON.stringify(err));
            $scope.photo = 'public/dist/img/300x300.png';
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

  };


  $scope.add = function(){     
     var datos = {
                porteros_id: $rootScope.User.id,
                tipo: $scope.tipo,
                accion: $scope.accion,
                imagen: $scope.data.imagen,
                cedula: $scope.data.cedula
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'reportespersonal', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Reporte de Personal, registrado con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $rootScope.personallist = [];  
        $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.personallist = response.personal; 
                $state.go('personal');
                
            })
            .error(function(response){
                console.log(response);
            });

            
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: response,
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }


  $scope.reportespersonal = function(){
        $rootScope.personallist = [];  
        $http.get($rootScope.ruta+'personal/index/'+$rootScope.inmueble_id)
            .success(function(response){
                //console.log(response);
                $rootScope.personallist = response.personal; 
                $state.go('personal');
                
            })
            .error(function(response){
                console.log(response);
            });
  }
  

})

// fin personal planta

// encuestas

.controller('EncuestasCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $scope.pas = 0;
  $scope.encuestasedit = function(id){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.preguntaslist = [];  
      $rootScope.encuestas2list = []; 
      $http.get($rootScope.ruta+'encuestas/edit/'+$rootScope.inmueble_id+'/'+id)
          .success(function(response){
              //console.log(response);
              $rootScope.preguntaslist = response.preguntas; 
              $rootScope.encuestas2list = response.encuestas2; 
              $ionicLoading.hide();
              $state.go('encuestasedit');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });

  }

  $scope.encuestasshow = function(id){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.preguntaslist = [];  
      $rootScope.encuestas2list = [];
      $rootScope.encuestasresponlist = [];  
      $http.get($rootScope.ruta+'encuestas/show/'+$rootScope.Vecinos.id+'/'+id)
          .success(function(response){
              //console.log(response);
              $rootScope.preguntaslist = response.preguntas; 
              $rootScope.encuestas2list = response.encuestas2; 
              $rootScope.encuestasresponlist = response.encuestasrespon;
              $ionicLoading.hide();
              $state.go('encuestasshow');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });

  }

  $scope.encuestasresultados = function(id){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.preguntaslist = [];  
      $rootScope.encuestas2list = [];
      $rootScope.resultadoslist = [];  
      $http.get($rootScope.ruta+'encuestas/resultados/'+id)
          .success(function(response){
              //console.log(response);
              $rootScope.preguntaslist = response.preguntas; 
              $rootScope.encuestas2list = response.encuestas2; 
              $rootScope.resultadoslist = response.resultados;
              $ionicLoading.hide();
              $state.go('encuestasresultados');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });

  }


})

.controller('EncuestascreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
 $scope.data = {}
 $scope.multiple = 1;
 $scope.data.tipo = '0';

 $scope.cambio = function(tipo){
    if(tipo == '0'){
      $scope.multiple = 1;
      angular.element('#preguno').val('');
      $scope.data.preguno = '';
      angular.element('#pregdos').val('');
      $scope.data.pregdos = '';
      angular.element('#pregtres').val('');
      angular.element('#pregcuatro').val('');
    }else if(tipo == '1'){
      $scope.multiple = 0;
      angular.element('#preguno').val('Si');
      $scope.data.preguno = 'Si';
      angular.element('#pregdos').val('No');
      $scope.data.pregdos = 'No';
      angular.element('#pregtres').val('');
      angular.element('#pregcuatro').val('');
    }else{
      $scope.multiple = 0;
      angular.element('#preguno').val('0-5');
      $scope.data.preguno = '0-5';
      angular.element('#pregdos').val('');
      $scope.data.pregdos = '';
      angular.element('#pregtres').val('');
      angular.element('#pregcuatro').val('');
    }
 }

 $scope.encuestas = function(){

   $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            $ionicLoading.hide();
            $state.go('encuestas');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });
 }

 $scope.add = function(){
    
    var datos = {
          accion: $scope.data.accion,
          inmueble_id: $rootScope.inmueble_id,
          nombre: $scope.data.nombre,
          tipo: $scope.data.tipo,
          pregunta: $scope.data.pregunta,
          preguno: $scope.data.preguno,
          pregdos: $scope.data.pregdos,
          pregtres: $scope.data.pregtres,
          pregcuatro: $scope.data.pregcuatro
      }

       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

      $http.post($rootScope.ruta+'encuestas', datos).success(function(response) {

            

            if ($scope.data.accion == 'fin') {
               $ionicLoading.hide();
              $ionicPopup.alert({
              content: 'Encuesta, registrada con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

              $rootScope.encuestaslist = [];  
              $rootScope.encuestasresplist = [];  
              $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
                  .success(function(response){
                      //console.log(response);
                      $rootScope.encuestaslist = response.encuestas; 
                      if ($rootScope.User.roles_id == 3) {
                        $rootScope.encuestasresplist = response.encuestasrespon; 
                      }
                      
                      $state.go('encuestas');
                      
                  })
                  .error(function(response){
                      console.log(response);
                  });


            }else{
                $ionicLoading.hide();
                $ionicPopup.alert({
                  content: 'Continue editando su encuesta!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });

                $rootScope.preguntaslist = [];  
                $rootScope.encuestas2list = [];
                $http.get($rootScope.ruta+'encuestas/edit/'+$rootScope.inmueble_id+'/'+response.encu.id)
                    .success(function(response){
                        //console.log(response);
                        $rootScope.preguntaslist = response.preguntas; 
                        $rootScope.encuestas2list = response.encuestas2; 
                        
                        $scope.multiple = 1;
                        $scope.data.tipo = '0';
                        $state.go('encuestasedit');
                        
                    })
                    .error(function(response){
                        console.log(response);
                    });

            }

        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: response,
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  

 }

})

.controller('EncuestaseditCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {


 $scope.data = {}
 $scope.multiple = 1;
 $scope.data.tipo = '0';

 $scope.delete = function(id){

    var confirmPopup = $ionicPopup.confirm({
     title: 'Eliminar Pregunta',
     template: '¿Esta seguro de eliminar esta pregunta?',
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

      $http.delete($rootScope.ruta+'encuestas/delete/'+id)
        .success(function(response){

                  
                $http.get($rootScope.ruta+'encuestas/edit/'+$rootScope.inmueble_id+'/'+$rootScope.encuestas2list.id)
                    .success(function(response){
                        $rootScope.preguntaslist = [];  
                        $rootScope.encuestas2list = [];

                        $rootScope.preguntaslist = response.preguntas; 
                        $rootScope.encuestas2list = response.encuestas2; 
                        
                        $scope.multiple = 1;
                        $scope.data.tipo = '0';
                        $ionicLoading.hide();
                        $state.go('encuestasedit');
                        
                    })
                    .error(function(response){
                       $ionicLoading.hide();
                        console.log(response);
                    });
            
            
        })
        .error(function(response){
            console.log(response);
        });


          
     } else {
       console.log('no cerrar');
     }
   });

  }

 $scope.cambio = function(tipo){
    if(tipo == '0'){
      $scope.multiple = 1;
      angular.element('#preguno').val('');
      $scope.data.preguno = '';
      angular.element('#pregdos').val('');
      $scope.data.pregdos = '';
      angular.element('#pregtres').val('');
      angular.element('#pregcuatro').val('');
    }else if(tipo == '1'){
      $scope.multiple = 0;
      angular.element('#preguno').val('Si');
      $scope.data.preguno = 'Si';
      angular.element('#pregdos').val('No');
      $scope.data.pregdos = 'No';
      angular.element('#pregtres').val('');
      angular.element('#pregcuatro').val('');
    }else{
      $scope.multiple = 0;
      angular.element('#preguno').val('0-5');
      $scope.data.preguno = '0-5';
      angular.element('#pregdos').val('');
      $scope.data.pregdos = '';
      angular.element('#pregtres').val('');
      angular.element('#pregcuatro').val('');
    }
 }

 $scope.data.nombre = $rootScope.encuestas2list.nombre;

  $scope.add = function(){
    
    var datos = {
          accion: $scope.data.accion,
          inmueble_id: $rootScope.inmueble_id,
          encuestas_id: $rootScope.encuestas2list.id,
          tipo: $scope.data.tipo,
          pregunta: $scope.data.pregunta,
          preguno: $scope.data.preguno,
          pregdos: $scope.data.pregdos,
          pregtres: $scope.data.pregtres,
          pregcuatro: $scope.data.pregcuatro
      }

      $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

      $http.post($rootScope.ruta+'encuestas', datos).success(function(response) { 

            if ($scope.data.accion == 'findos') {
              $ionicLoading.hide();
              $ionicPopup.alert({
                content: 'Encuesta, registrada con exito!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });

              $rootScope.encuestaslist = [];  
              $rootScope.encuestasresplist = [];  
              $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
                  .success(function(response){
                      //console.log(response);
                      $rootScope.encuestaslist = response.encuestas; 
                      if ($rootScope.User.roles_id == 3) {
                        $rootScope.encuestasresplist = response.encuestasrespon; 
                      }
                      
                      $state.go('encuestas');
                      
                  })
                  .error(function(response){
                      console.log(response);
                  });


            }else{
                $ionicLoading.hide();
                $ionicPopup.alert({
                  content: 'Continue editando su encuesta!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });

                $rootScope.preguntaslist = [];  
                $rootScope.encuestas2list = []; 
                $http.get($rootScope.ruta+'encuestas/edit/'+$rootScope.inmueble_id+'/'+response.encu.id)
                    .success(function(response){
                        //console.log(response);
                        $rootScope.preguntaslist = response.preguntas; 
                        $rootScope.encuestas2list = response.encuestas2; 
                        $scope.multiple = 1;
                        $scope.data.tipo = '0';
                        $state.go('encuestasedit');
                        
                    })
                    .error(function(response){
                        console.log(response);
                    });

            }

        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: response,
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  

 }


  $scope.encuestas = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            $ionicLoading.hide();
            $state.go('encuestas');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });
 }

})

.controller('EncuestasshowCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {


  $scope.data = {}

  $scope.add = function(){ 
    var i = 0;
    var respuesta = '';

    angular.forEach($rootScope.preguntaslist, function(preg, key) {

      if(preg.tipo == '0'){
        if($scope.data.resp[i][0] == true){
          respuesta = '1';
        }else if($scope.data.resp[i][1] == true){
          respuesta = '2';
        }else if($scope.data.resp[i][2] == true){
          respuesta = '3';
        }else if($scope.data.resp[i][3] == true){
          respuesta = '4';
        }
      }else if(preg.tipo == '1'){
        if($scope.data.resp[i][0] == true){
          respuesta = '1';
        }else if($scope.data.resp[i][1] == true){
          respuesta = '2';
        }
      }else{
        respuesta = $scope.data.resp[i][0];
      }


      var datos = {
                preguntas_id: preg.id,
                vecinos_id: $rootScope.Vecinos.id,
                respuesta: respuesta,
                encuesta_id: $rootScope.encuestas2list.id,
                ref: i
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

      $http.post($rootScope.ruta+'respescuestas', datos).success(function(response) {

                                 
            $ionicLoading.hide();
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Respuesta no se envio, intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        }); 


        i = i + 1;

    });


    $ionicPopup.alert({
              content: 'Respuesta, enviada con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            
            $state.go('encuestas');
            
        })
        .error(function(response){
            console.log(response);
        });
     

         
      
  }


  $scope.data.nombre = $rootScope.encuestas2list.nombre;

  
    

  $scope.encuestas = function(){
    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            
            $state.go('encuestas');
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });
 }
})

.controller('EncuestasresultadosCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {


  $scope.data = {}
  $scope.data.nombre = $rootScope.encuestas2list.nombre;
  $scope.p1 = 0;
  $scope.p2 = 0;
  $scope.p3 = 0;
  $scope.p4 = 0;
  $scope.p5 = 0;
  $scope.p6 = 0;
  $scope.prom = 0;
  $scope.y = 0;
  


  angular.forEach($rootScope.preguntaslist, function(preg, key) {
      angular.forEach($rootScope.resultadoslist, function(resu, ke) {
          if (preg.tipo == '0') {
            if (preg.id == resu.preguntas_id) {
              if (resu.respuesta == '1') {
                  $scope.p1 = $scope.p1 + 1;
              }else if (resu.respuesta == '2') {
                  $scope.p2 = $scope.p2 + 1;
              }else if (resu.respuesta == '3') {
                  $scope.p3 = $scope.p3 + 1;
              }else if (resu.respuesta == '4') {
                  $scope.p4 = $scope.p4 + 1;
              }
            }
          }else if(preg.tipo == '1'){
            if (preg.id == resu.preguntas_id) {
              if (resu.respuesta == '1') {
                  $scope.p5 = $scope.p5 + 1;
              }else if (resu.respuesta == '2') {
                  $scope.p6 = $scope.p6 + 1;
              }
            }
          }else{
            if (preg.id == resu.preguntas_id) {
              $scope.prom = $scope.prom + parseFloat(resu.respuesta);
              $scope.y = $scope.y + 1; 
            }
          }
      });
  });

  if ($scope.y > 0) {
    $scope.prom = $scope.prom / $scope.y;
  }else{
    $scope.prom = 0;
  }

  


  $scope.encuestas = function(){
    $rootScope.encuestaslist = [];  
    $rootScope.encuestasresplist = [];  
    $http.get($rootScope.ruta+'encuestas/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.encuestaslist = response.encuestas; 
            if ($rootScope.User.roles_id == 3) {
              $rootScope.encuestasresplist = response.encuestasrespon; 
            }
            
            $state.go('encuestas');
            
        })
        .error(function(response){
            console.log(response);
        });
 }
})

// fin encuestas

// solicitudes


.controller('SolicitudesCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {

    $scope.solicitudescalendario = function(){

       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

      $rootScope.fechasselect = []; 
      $http.get($rootScope.ruta+'solicitudes/fechas/'+$rootScope.inmueble_id)
          .success(function(response){
              console.log(response);
              $rootScope.fechasselect = response;
              $ionicLoading.hide();           
              $state.go('solicitudescalendario');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });


    }

    $scope.solicitudescreate = function(){
       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.actividadeslist = []; 
      $http.get($rootScope.ruta+'solicitudes/create/'+$rootScope.inmueble_id)
          .success(function(response){
              console.log(response);
              $rootScope.actividadeslist = response.actividades;
              $ionicLoading.hide();           
              $state.go('solicitudescreate');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });


    }

    $scope.solicitudesedit = function(id){
       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.solicitudeslist = []; 
      $rootScope.vecinoslist = []; 
      $http.get($rootScope.ruta+'solicitudes/edit/'+id)
          .success(function(response){
              
              $rootScope.solicitudeslist = response.solicitudes[0];
              $rootScope.vecinoslist = response.vecinos[0];    
              $ionicLoading.hide();       
              $state.go('solicitudesedit');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });


    }

})

.controller('SolicitudescalendarioCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  $rootScope.eventoslist = [];

  $scope.mostrar = function(date){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      
    $http.get($rootScope.ruta+'solicitudes/verfechas/'+$rootScope.inmueble_id+'/'+date)
        .success(function(response){
            $ionicLoading.hide();
            $rootScope.eventoslist = response; 
            
        })
        .error(function(response){
            $ionicLoading.hide();
            console.log(response);
        });
  }

  $scope.solicitudescreate = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.actividadeslist = []; 
      $http.get($rootScope.ruta+'solicitudes/create/'+$rootScope.inmueble_id)
          .success(function(response){
              console.log(response);
              $rootScope.actividadeslist = response.actividades; 
              $ionicLoading.hide();          
              $state.go('solicitudescreate');
              
          })
          .error(function(response){
             $ionicLoading.hide();
              console.log(response);
          });


    }

  $scope.solicitudes = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.solicitudeslist = [];  
    $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.solicitudeslist = response.solicitudes; 
            $ionicLoading.hide();
            $state.go('solicitudes');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

})

.controller('SolicitudescreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading, ionicTimePicker) {
  var val = (((new Date()).getHours() * 60 * 60));
  var d = new Date(val * 1000);
  var hour = d.getUTCHours() == 0 ? 12 : (d.getUTCHours() > 12 ? d.getUTCHours() - 12 : d.getUTCHours());
  var min = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
  var ampm = d.getUTCHours() < 12 ? 'am' : 'pm';
  var time = hour + ':' + min + ' ' + ampm;
  var time2 = (parseInt(hour)+1) + ':' + min + ' ' + ampm;

  $scope.horainicio = time;
  $scope.horafin = time2;


  $scope.openTimePicker1 = function () {
      var ipObj1 = {
        callback: function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var d = new Date(val * 1000);
            var hour = d.getUTCHours() == 0 ? 12 : (d.getUTCHours() > 12 ? d.getUTCHours() - 12 : d.getUTCHours());
            var min = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
            var ampm = d.getUTCHours() < 12 ? 'am' : 'pm';
            var time = hour + ':' + min + ' ' + ampm;
            $scope.horainicio = time;
            console.log(time);
          }
        },
      };
      ionicTimePicker.openTimePicker(ipObj1);
    };

    $scope.openTimePicker2 = function () {
      var ipObj1 = {
        callback: function (val) {
          if (typeof (val) === 'undefined') {
            console.log('Time not selected');
          } else {
            var d = new Date(val * 1000);
            var hour = d.getUTCHours() == 0 ? 12 : (d.getUTCHours() > 12 ? d.getUTCHours() - 12 : d.getUTCHours());
            var min = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
            var ampm = d.getUTCHours() < 12 ? 'am' : 'pm';
            var time = hour + ':' + min + ' ' + ampm;
            $scope.horafin = time;
            console.log(time);
          }
        },
      };
      ionicTimePicker.openTimePicker(ipObj1);
    };
  
  $scope.solicitudes = function(){

     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

    $rootScope.solicitudeslist = [];  
    $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.solicitudeslist = response.solicitudes; 
            $ionicLoading.hide();
            $state.go('solicitudes');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }


  $scope.data = {}

  $scope.add = function(){     
     var datos = {
                inmuebles_id: $rootScope.inmueble_id,
                users_id: $rootScope.User.id,
                actividades_id: $scope.data.actividades_id,
                descripcion: $scope.data.descripcion,
                fecha: $scope.data.fecha,
                horainicio: $scope.horainicio,
                horafinal: $scope.horafin
            }

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'solicitudes', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Solicitud, enviada con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $rootScope.solicitudeslist = [];  
            $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
                .success(function(response){
                    //console.log(response);
                    $rootScope.solicitudeslist = response.solicitudes; 
                    
                    $state.go('solicitudes');
                    
                })
                .error(function(response){
                    console.log(response);
                });
            
          
        }).error(function(response){
          console.log(response);
           $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Solicitud no se envio, intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }


})

.controller('SolicitudeseditCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading) {
  
  $scope.enviar = function(tipo, id){

    var confirmPopup = $ionicPopup.confirm({
     title: 'Solicitudes',
     template: '¿Esta seguro de ejecutar esta accion?',
     okText: '<i class="ion-checkmark-round"></i>',
     cancelText: '<i class="ion-close-round"></i>',
     cancelType: 'button-assertive',
     okType: 'button-energized',
   });

   confirmPopup.then(function(res) {
     if(res) {
        var datos = {
          id: id,
          inmuebles_id: $rootScope.inmueble_id,
          status: tipo
        }

        $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.put($rootScope.ruta+'solicitudes', datos).success(function(response) { 
            $ionicLoading.hide();
            $ionicPopup.alert({
                content: 'Solicitud actualizada con exito',
                okType: 'button-assertive',
                okText: 'Ok'
              });

            $rootScope.solicitudeslist = [];  
            $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
                .success(function(response){
                    //console.log(response);
                    $rootScope.solicitudeslist = response.solicitudes; 
                    
                    $state.go('solicitudes');
                    
                })
                .error(function(response){
                    console.log(response);
                });
            

        }).error(function(response){
          $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Error intente de nuevo',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        }); 


          
     } else {
       console.log('no cerrar');
     }
   });

  }

  $scope.solicitudes = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.solicitudeslist = [];  
    $http.get($rootScope.ruta+'solicitudes/index/'+$rootScope.User.id+'/'+$rootScope.inmueble_id)
        .success(function(response){
            //console.log(response);
            $rootScope.solicitudeslist = response.solicitudes; 
            $ionicLoading.hide();
            $state.go('solicitudes');
            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

})

// fin solicitudes

.controller('PropiedadesCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {
  $scope.max = 500;
  $scope.current = $rootScope.propiedadeslist.avaluo;

  $ionicModal.fromTemplateUrl('image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
  
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };
  
    $scope.goToSlide = function(index) {
      $scope.modal.show();
      $ionicSlideBoxDelegate.slide(index);
    }
  
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };




  $scope.verplanos = function(id){
       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.aImages = [];  
      $http.get($rootScope.ruta+'planos/index/'+id)
        .success(function(response){
            $ionicLoading.hide();
            //console.log(response);
            $rootScope.aImages = response.planos; 
            $scope.msj = 'Mis Planos';
            $scope.modal.show();
            $ionicSlideBoxDelegate.slide(0);

            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.verescrituras = function(id){
       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.aImages = [];  
      $http.get($rootScope.ruta+'escrituras/index/'+id)
        .success(function(response){
           $ionicLoading.hide();
            //console.log(response);
            $rootScope.aImages = response.escrituras; 
            $scope.msj = 'Mis Escrituras';
            $scope.modal.show();

            
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.mipropiedadedit = function(id){
       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.planoslist = []; 
      $rootScope.escrituraslist = [];  
      $rootScope.propiedadeslist2 = [];  
      $http.get($rootScope.ruta+'propiedades/edit/'+id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.planoslist = response.planos; 
            $rootScope.escrituraslist = response.escrituras;  
            $rootScope.propiedadeslist2 = response.propiedades; 

            $state.go('propiedadesedit');
        })
        .error(function(response){
           $ionicLoading.hide();
            console.log(response);
        });
  }
  

})

.controller('PropiedadescreateCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {
  
  $scope.data = {}
  
  $scope.add = function(){     
     var datos = {
                vecinos_id: $rootScope.Vecinos.id,
                avaluo: $scope.data.avaluo,
                construccion: $scope.data.construccion
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.post($rootScope.ruta+'propiedades', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Informacion de propiedad registrada con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $state.go('app.inicio');

          
        }).error(function(response){
          $ionicLoading.hide();

          $ionicPopup.alert({
                content: 'intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

})

.controller('PropiedadeseditCtrl', function($scope, $state, $rootScope, $http, $ionicPopup, $cordovaFileTransfer, $cordovaCamera, $ionicLoading, $ionicModal, $ionicSlideBoxDelegate) {

  $scope.data = {}

  $scope.data.avaluo = $rootScope.propiedadeslist2.avaluo;
  $scope.data.construccion = $rootScope.propiedadeslist2.construccion;

  $scope.add = function(){     
     var datos = {
                id: $rootScope.propiedadeslist2.id,
                avaluo: $scope.data.avaluo,
                construccion: $scope.data.construccion
            }

             $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });

        $http.put($rootScope.ruta+'propiedades', datos).success(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              content: 'Informacion de propiedad actualizada con exito!!!',
              okType: 'button-assertive',
              okText: 'Ok'
            });

            $rootScope.propiedadeslist = [];  
            $http.get($rootScope.ruta+'propiedades/index/'+$rootScope.Vecinos.id)
                .success(function(response){
                    //console.log(response);
                    $rootScope.propiedadeslist = response.propiedades[0]; 
                    
                    $state.go('propiedades');
                    
                })
                .error(function(response){
                    console.log(response);
                });

          
        }).error(function(response){
          $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'intente de nuevo!!!',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        });  
      
  }

  $scope.getPhoto = function(source, tipo){
    var objConfig = {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : (source === 'camera') ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.SAVEDPHOTOALBUM,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
    
    $cordovaCamera.getPicture(objConfig).then(function(imageData){
        
        var options = {
            fileKey: "imagen",
            fileName: imageData,
            chunkedMode: false,
            mimeType: "image/jpeg"
        };

        $cordovaFileTransfer.upload("http://ihomeapp.net/upload.php", imageData, options).then(function(result) {
            

            var datos = {
                propiedades_id: $rootScope.propiedadeslist2.id,
                imagen: result.response,
            }

            $http.post($rootScope.ruta+tipo, datos).success(function(response) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                  content: 'Imagen cargada con exito!!!',
                  okType: 'button-assertive',
                  okText: 'Ok'
                });
              
            }).error(function(response){
              $ionicLoading.hide();
              $ionicPopup.alert({
                    content: 'Imagen no guardada, intente de nuevo!!!',
                    okType: 'button-assertive',
                    okText: 'Ok'
                  });
            }); 





        }, function(err) {
            $ionicLoading.hide();
            alert('Error!! '+ JSON.stringify(err));
        }, function (progress) {
            $ionicLoading.show({
              content: 'Subiendo...',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });
        });


    },function(error){
      console.log(error);
    });

  };

  $scope.eliminar = function(id, msj){

    var confirmPopup = $ionicPopup.confirm({
     title: msj,
     template: '¿Esta seguro de eliminar?',
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
        var tipo = 'planos';
        if(msj == 'Mis Planos'){
          tipo = 'planos';
        }else{
          tipo = 'escrituras';
        }

        $http.delete($rootScope.ruta+tipo+'/delete/'+id).success(function(response) { 
            $ionicLoading.hide();
            $ionicPopup.alert({
                content: 'Informacion eliminada con exito',
                okType: 'button-assertive',
                okText: 'Ok'
              });

              $ionicSlideBoxDelegate.slide(0);
              $scope.modal.hide();
            

        }).error(function(response){
          $ionicLoading.hide();
          $ionicPopup.alert({
                content: 'Error intente de nuevo',
                okType: 'button-assertive',
                okText: 'Ok'
              });
        }); 


          
     } else {
       console.log('no cerrar');
     }
   });

  }

  $ionicModal.fromTemplateUrl('image-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $ionicSlideBoxDelegate.slide(0);
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hide', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    // Call this functions if you need to manually control the slides
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
  
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };
  
    $scope.goToSlide = function(index) {
      $scope.modal.show();
      $ionicSlideBoxDelegate.slide(index);
    }
  
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };




  $scope.verplanos = function(id){
       $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.aImages = [];  
      $http.get($rootScope.ruta+'planos/index/'+id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.aImages = response.planos; 
            $scope.msj = 'Mis Planos';
            $scope.modal.show();
            $ionicSlideBoxDelegate.slide(0);

            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.verescrituras = function(id){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
      $rootScope.aImages = [];  
      $http.get($rootScope.ruta+'escrituras/index/'+id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            $rootScope.aImages = response.escrituras; 
            $scope.msj = 'Mis Escrituras';
            $scope.modal.show();

            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }

  $scope.mipropiedad = function(){
     $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              animation: 'fade-in',
              noBackdrop: false
            });
    $rootScope.propiedadeslist = [];  
    $http.get($rootScope.ruta+'propiedades/index/'+$rootScope.Vecinos.id)
        .success(function(response){
            //console.log(response);
            $ionicLoading.hide();
            if(response.propiedades.length == 0){
              $state.go('propiedadescreate');
            }else{
              $rootScope.propiedadeslist = response.propiedades[0];
              $state.go('propiedades');
            }
            
        })
        .error(function(response){
          $ionicLoading.hide();
            console.log(response);
        });

  }
  

});

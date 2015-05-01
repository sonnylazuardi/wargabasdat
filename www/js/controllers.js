angular.module('basdat.controllers', [])

.controller('AppCtrl', function($scope) {
  // $scope.isWebView = ! (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1);
})

.controller('LoginCtrl', function($scope, $state, $firebaseAuth, $cordovaOauth, Auth, AuthHelper, FBURL) {

  $scope.auth = Auth;
  $scope.auth.$onAuth(function(authData) {
    console.log(authData);
    if (authData) {
      $state.go('tab.profile');  
    }
  });

  $scope.succeed = function(authData) {
    console.log(authData);
    if (authData) {
      var ref = new Firebase(FBURL);
      ref.child("users").child(authData.uid).update({
        provider: authData.provider,
        name: AuthHelper.getName(authData),
        picture: AuthHelper.getPicture(authData)
      });
    }
  }

  $scope.facebook = function() {
    $cordovaOauth.facebook("1384085425231929", ["email"]).then(function(result) {
      auth.$authWithOAuthToken("facebook", result.access_token).then(function(authData) {
        console.log(JSON.stringify(authData));
      }, function(error) {
        console.error("ERROR: " + error);
      });
    }, function(error) {
      Auth.$authWithOAuthPopup("facebook").then($scope.succeed).catch(function(error) {
        console.log("Authentication failed:", error);
      });
    });
  }
})

.controller('NavCtrl', function($scope, $state, Auth, AuthHelper) {
  $scope.auth = Auth;
  $scope.profile = {};

  $scope.auth.$onAuth(function(authData) {
    if (authData) {
      $scope.authData = authData; 
      $scope.profile = AuthHelper.getCurrentUser(authData);
    } else {
      $state.go('login');
    }
  });

  $scope.logout = function() {
    $scope.auth.$unauth();
  };
})

.controller('ProfileCtrl', function($scope, $state, Auth, AuthHelper, $ionicPopup, $ionicLoading) {
  $scope.auth = Auth;
  $scope.profile = null;
  $scope.auth.$onAuth(function(authData) {
    if (authData) {
      $scope.authData = authData; 
      $ionicLoading.show({
        template: 'Loading...'
      });
      var sync = AuthHelper.getCurrentUser(authData);
      sync.$bindTo($scope, 'profile');
      sync.$loaded().then(function() {
        $scope.profile.birth_date = new Date($scope.profile.birth_dates);
        console.log($scope.profile.birth_date);
        $ionicLoading.hide();
      });
    } else {
      $state.go('login');
    }
  });

  $scope.changeBirth = function() {
    $scope.profile.birth_dates = $scope.profile.birth_date.getTime();
    console.log($scope.profile.birth_dates);
  };

  $scope.next = function() {
    var attrs = ['full_name', 'nim', 'email', 'phone', 'address', 'birth_place', 'birth_date'];
    var succeed = true;
    angular.forEach(attrs, function(item, i) {
      console.log($scope.profile[item]);
      if (($scope.profile[item] === '' || $scope.profile[item] == undefined) && succeed) {
        $ionicPopup.alert({
          title: 'Tidak bisa lanjut!',
          template: 'Ada form yang belum diisi!',
        });
        succeed = false;
        $scope.profile.stateProfile = false;
      }
    });
    if (succeed) {
      $scope.profile.stateProfile = true;
      $state.go('tab.biodata');
    }
  }
})

.service('AuthService', function(Auth, AuthHelper, $ionicPopup, $state) {
  var self = this;
  self.loadAuth = function($scope, stateReq, stateRedirect) {
    $scope.auth = Auth;
    $scope.profile = {};
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.auth.$onAuth(function(authData) {
        if (authData) {
          $scope.authData = authData; 
          var sync = AuthHelper.getCurrentUser(authData);
          sync.$bindTo($scope, 'profile');
          sync.$loaded().then(function() {
            if (!$scope.profile[stateReq]) {
              $ionicPopup.alert({
                title: 'Tidak bisa lanjut!',
                template: 'Lengkapi dulu data kamu!',
              });
              $state.go(stateRedirect);
            }
          });
        } else {
          $state.go('login');
        }
      });
    });
  }
  return self;
})

.controller('BiodataCtrl', function($scope, $state, $ionicPopup, AuthService) {
  AuthService.loadAuth($scope, 'stateProfile', 'tab.profile');
  $scope.next = function() {
    var attrs = ['about_self','strength','weakness','motivation','hope','korlab','barokah','selling'];
    var succeed = true;
    angular.forEach(attrs, function(item, i) {
      console.log($scope.profile[item]);
      if (($scope.profile[item] === '' || $scope.profile[item] == undefined) && succeed) {
        $ionicPopup.alert({
          title: 'Tidak bisa lanjut!',
          template: 'Ada form yang belum diisi!',
        });
        succeed = false;
        $scope.profile.stateBiodata = false;
      }
    });
    if (succeed) {
      $scope.profile.stateBiodata = true;
      $state.go('tab.users');
    }
  }
})

.controller('NewsCtrl', function($scope, AuthService) {
  AuthService.loadAuth($scope, 'stateBiodata', 'tab.biodata');
})

.controller('UsersCtrl', function($scope, Users, AuthService) {
  AuthService.loadAuth($scope, 'stateBiodata', 'tab.biodata');
  $scope.users = Users;
  $scope.users.$loaded(function() {
    // alert('loaded');
  });
});

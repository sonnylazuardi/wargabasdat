angular.module('basdat.users', [])

.factory("Auth", function($firebaseAuth, FBURL) {
  var ref = new Firebase(FBURL);
  return $firebaseAuth(ref);
})

.service('AuthHelper', function($q, $firebaseObject, FBURL) {
  var self = this;
  self.getCurrentUser = function (authData) {
    var ref = new Firebase(FBURL);
    return $firebaseObject(ref.child('users').child(authData.uid));
  };
  self.getName = function (authData) {
    if (!authData) return;
    switch(authData.provider) {
      case 'google':
        return authData.google.displayName;
      case 'facebook':
        return authData.facebook.displayName;
    }
  };
  self.getPicture = function (authData) {
    if (!authData) return;
    switch(authData.provider) {
      case 'google':
        return authData.google.cachedUserProfile.picture;
      case 'facebook':
        return authData.facebook.cachedUserProfile.picture.data.url;
    }
  }
  return self;
});
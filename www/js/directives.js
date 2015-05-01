angular.module('basdat.directives', [])

.directive('croppedImage', function ($parse) {
  return {
    restrict: "E",
    replace: true,
    template: "<div class='center-cropped'></div>",
    link: function(scope, element, attrs) {
      scope.$watch('source', function() {
        var width = attrs.width;
        var height = attrs.height;
        element.css('width', width);
        element.css('height', height);
        element.css('backgroundPosition', 'center center');
        element.css('backgroundSize', 'cover');
        element.css('backgroundRepeat', 'no-repeat');
        element.css('backgroundImage', "url('" + attrs.source + "')");
      });
    }
  }
});
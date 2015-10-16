'use strict';

angular.module('instantFeedApp')
  .controller('PublisherController', function ($scope, $http, Upload, socket) {
    var vm = this;
    vm.messages = [];

    $http.get('/api/messages').success(function(messages) {
      vm.messages = messages;
      socket.syncUpdates('message', vm.messages);
    });


    vm.publishMessage = function() {
      if (vm.newMessage.text === '' || vm.newMessage.belongsTo === '') {
        return;
      }
    if (vm.newMessage.picture) {
      uploadImage(vm.newMessage.picture)
        .then(function(response) {
          console.log(response.data);
          return;
        });
    }
    vm.newMessage.timePublished = new Date();
    $http.post('/api/messages', vm.newMessage);
    vm.newMessage = {};
    };

    function uploadImage(image) {
      return Upload.upload({
        url: 'http://localhost:9000/api/images',
        data: {
          file: image
        },
        method: 'POST',
        headers: {
          'Content-Type': image.type
        }
      });
    };

    vm.changeMessage = function(message) {
      $http.put('/api/messages/' + message._id, message);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('message');
    });
  });

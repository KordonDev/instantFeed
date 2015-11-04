'use strict';

angular.module('instantFeedApp')
  .factory('messageService', function ($resource, Upload) {
    var messageService =  {
      getMessages: getMessages,
      addMessage: addMessage,
      updateMessage: updateMessage,
      deleteMessage: deleteMessage
    };

    var messageResource = $resource('/api/messages/:id', {id: '@_id'}, {update: {method: 'PUT'}});
    var imageResource = $resource('/api/images/');

    function getMessages(){
      return messageResource.query().$promise
        .then(function(result) {
          if (result) {
            return result;
          }
          return [];
        });
    };

    function addMessage(message, image) {
      if (image) {
        uploadImage(image)
          .then(function(response) {
            message.picture = response.data;
            return messageResource.save(message).$promise;
          });
      } else {
        return messageResource.save(message).$promise;
      }
    };

    function updateMessage(message, image) {
      if (message.removePicture) {
        imageResource.delete({imagePath: message.picture}).$promise
          .then(function() {
            message.picture = "";
            if (image) {
              return uploadImageAndUpdateMessage(message, image);
            }
            return messageResource.update(message);
          });
      }
      if (image) {
        return uploadImageAndUpdateMessage(message, image);
      }
      return messageResource.update(message);
    }

    function uploadImageAndUpdateMessage(message, image) {
      uploadImage(image)
        .then(function(response) {
          message.picture = response.data;
          return messageResource.update(message);
        });
    }

    function uploadImage(image) {
      return Upload.upload({
        url: '/api/images',
        data: {
          file: image
        },
        method: 'POST',
        headers: {
          'Content-Type': image.type
        }
      });
    }

    function deleteMessage(message) {
      return messageResource.delete({id:message._id}).$promise;
    }

    return messageService;
  });

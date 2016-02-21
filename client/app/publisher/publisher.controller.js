'use strict';

angular.module('instantFeedApp')
  .controller('PublisherController', function ($scope, socket, Message, Feed) {
    var vm = this;
    vm.messages = [];

    /*
    * Queries all messages for feed.
    */
    Feed.getAllMessages()
      .then(function(messages) {
        return Feed.setTopicNameForMessages(messages);
      })
      .then(function(messages) {
        vm.messages = Feed.sameTopicSideBySide(messages);
        socket.syncUpdates('message', vm.messages, addMessageToFeed);
      });

    /*
    * Adds the message to the feed, if its topic is in the selectedTopics.
    */
    function addMessageToFeed(event, message, array) {
      var messages = vm.messages;
      Feed.setTopicNameForMessages([message])
        .then(function(message) {
          message = message[0];
          messages.unshift(message);
          vm.messages = Feed.sameTopicSideBySide(messages);
        });
    }

    /*
    * Saves a message on the server.
    */
    vm.publishMessage = function(message, image) {
      message.timePublished = new Date();
      return Message.add(message, image)
        .then(function(response) {
          return response;
        }
      );
    };

    /*
    * Loads the next messages for the feed.
    */
    vm.loadMoreMessages = function() {
      if (vm.messages.length > 0) {
        Feed.getAllMessages(vm.messages.length)
          .then(function(newMessages) {
            return Feed.setTopicNameForMessages(newMessages);
          })
          .then(function(messages) {
            messages = vm.messages.concat(messages);
            messages = Feed.sortByDateDescendend(messages);
            vm.messages = Feed.sameTopicSideBySide(messages);
          });
      }
    };

    /*
    * Ends the syncing with new messages.
    */
    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('message');
    });
});

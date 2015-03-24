var debug = require('debug')('socket');
var clients = {};

module.exports.clients = clients
module.exports.Server = p2pSocket;

function p2pSocket(socket, next){
  socket.emit('numClients', Object.keys(clients).length)
  socket.broadcast.emit('connected_peer', socket.id)

  clients[socket.id] = socket;
  socket.on('disconnect', function() {
    delete clients[socket.id]
    debug('Client gone (id=' + socket.id + ').');
  });

  socket.on('offers', function(data) {
    Object.keys(clients).forEach(function(clientId, i) {
      var client = clients[clientId];
      if (client !== socket) {
        var offerObj = data.offers[i];
        var emittedOffer = {fromPeerId: socket.id, offerId: offerObj.offerId, offer: offerObj.offer};
        debug("Emitting offer: %s", JSON.stringify(emittedOffer))
        client.emit('offer', emittedOffer);
      }
    });
  })

  socket.on('peer-signal', function(data) {
    var toPeerId = data.toPeerId;
    var client = clients[toPeerId];
    client.emit('peer-signal', data)
  });
  next();
};

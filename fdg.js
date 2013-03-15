var fdg = {};

fdg.Vector = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
  //this.x = x || Math.random() * 50;
  //this.y = y || Math.random() * 50;
};

fdg.Vector.prototype.add = function(v) {
  return new fdg.Vector(this.x + v.x, this.y + v.y);
};

fdg.Vector.prototype.diff = function(v) {
  return new fdg.Vector(this.x - v.x, this.y - v.y);
};

fdg.Vector.prototype.mult = function(s) {
  return new fdg.Vector(this.x * s, this.y * s);
};

fdg.Vector.prototype.len = function() {
  return fdg.util.pythagorean(this.x, this.y);
};
  
fdg.Vector.prototype.normalize = function() {
  var len = this.len();
  var x = this.x, y = this.y;
  if (len == 0) {
    x = Math.random() - 0.5;
    y = Math.random() - 0.5;
    len = fdg.util.pythagorean(x, y);
  }
  return new fdg.Vector(x / len, y / len);
};

fdg.Node = function(id) {
  this.id = id;
  this.p = new fdg.Vector(0, 0); // position;
  this.v = new fdg.Vector(0, 0); // velocity
  this.edges = {};
};

fdg.Node.prototype.distance = function(other) {
  var v = this.p.diff(other.p);
  return Math.max(v.len(), 0.01);
};

fdg.Node.prototype.direction = function(other) {
  return this.p.diff(other.p).normalize();
};

fdg.Node.prototype.addEdge = function(id, other) {
  // TODO: Assert id doesn't exist.
  this.edges[id] = other;
  other.edges[id] = this;
};

fdg.Node.prototype.removeEdge = function(id) {
  // TODO: Assert both exist.
  delete this.edges[id].edges[id];
  delete this.edges[id];
};

fdg.Graph = function() {
  this.nodes = {};
  this.edges = {};
};

fdg.Graph.prototype.addNode = function(id) {
  this.nodes[id] = new fdg.Node(id);
};

fdg.Graph.prototype.removeNode = function(id) {
  for (var e in this.nodes[id].edges) {
    this.removeEdge(id);
  }
};

fdg.Graph.prototype.addEdge = function(id, nodeId1, nodeId2) {
  this.nodes[nodeId1].addEdge(id, this.nodes[nodeId2]);
  this.edges[id] = this.nodes[nodeId1];
};

fdg.Graph.prototype.removeEdge = function(id) {
  this.edges[id].removeEdge(id);
  delete this.edges[id];
};

fdg.Graph.prototype.advance = function(ts) {
  for (var nId in this.nodes) {
    var n = this.nodes[nId];
    var f = new fdg.Vector(0, 0); // forces
    // Update edge forces with Hooke's Law of Elasticity
    for (var e in n.edges) {
      var other = n.edges[e];
      var distance = n.distance(other);
      var sf = fdg.util.SC * (fdg.util.SL - distance);
      f = f.add(n.direction(other).mult(sf));
    }
    // Update layout forces.  (n^2, not n(n-1)/2. Close enough.)
    for (var otherId in this.nodes) {
      var other = this.nodes[otherId];
      if (other == n) { continue; }
      var distance = n.distance(other);
      var dsquared = Math.pow(distance, 2);
      // TODO: Add internode gravity?
      var lf = fdg.util.LF / dsquared;
      var dir = n.direction(other);
      f = f.add(dir.mult(lf));
    }
    // TODO: Add global gravity? (Down? Center?)
    // Apply friction.
    n.v = n.v.mult(Math.pow(fdg.util.FRICTION, ts*100));
    // Update velocity.
    f = f.mult(ts);
    n.v = n.v.add(f);
    // Move the node.
    n.p = n.p.add(n.v.mult(ts));
    // TODO: Position event.
  };
};

fdg.Graph.prototype.getWindow = function() {
  var minX = 10000000000;
  var maxX = -10000000000;
  var minY = 10000000000;
  var maxY = -10000000000;
  for (var nId in this.nodes) {
    var n = this.nodes[nId];
    minX = Math.min(minX, n.p.x);
    maxX = Math.max(maxX, n.p.x);
    minY = Math.min(minY, n.p.y);
    maxY = Math.max(maxY, n.p.y);
  }
  return [new fdg.Vector(minX, minY), new fdg.Vector(maxX, maxY)];
};

fdg.util = {};
fdg.util.pythagorean = function(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};
fdg.util.SL = 10;
fdg.util.SC = 10;
fdg.util.FRICTION = 0.9;
fdg.util.LF = 100;


fdg.drawGraph = function(g) {
  var win = g.getWindow();
  var ctx = document.getElementById('fdg').getContext('2d');
  ctx.fillStyle = 'white';
  ctx.clearRect(0,0,400,400);
  ctx.strokeStyle = 'green';
  for (var nId in g.nodes) {
    var n = g.nodes[nId];
    var range = 30;
    var x = ((n.p.x - win[0].x)/range)*140 + 5;
    var y = ((n.p.y - win[0].y)/range)*140 + 5;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
    ctx.stroke();
  }
  ctx.strokeStyle = 'blue';
  for (var eId in g.edges) {
    var n1 = g.edges[eId];
    var n2 = n1.edges[eId];
    var range = 30;
    var x1 = ((n1.p.x - win[0].x)/range)*140 + 5;
    var y1 = ((n1.p.y - win[0].y)/range)*140 + 5;
    var x2 = ((n2.p.x - win[0].x)/range)*140 + 5;
    var y2 = ((n2.p.y - win[0].y)/range)*140 + 5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
};


fdg.sample = new fdg.Graph();
fdg.sample.addNode(1);
fdg.sample.addNode(2);
fdg.sample.addNode(3);
fdg.sample.addNode(4);
fdg.sample.addNode(5);
fdg.sample.addNode(6);
fdg.sample.addNode(7);
fdg.sample.addNode(8);
fdg.sample.addEdge( 1, 1, 2);
fdg.sample.addEdge( 2, 2, 3);
fdg.sample.addEdge( 3, 3, 4);
fdg.sample.addEdge( 4, 4, 1);
fdg.sample.addEdge( 5, 5, 6);
fdg.sample.addEdge( 6, 6, 7);
fdg.sample.addEdge( 7, 7, 8);
fdg.sample.addEdge( 8, 8, 5);
fdg.sample.addEdge( 9, 1, 5);
fdg.sample.addEdge(10, 2, 6);
fdg.sample.addEdge(11, 3, 7);
fdg.sample.addEdge(12, 4, 8);

fdg.f = function() {
  window.setInterval(function() {
    fdg.sample.advance(0.01);
    fdg.drawGraph(fdg.sample);
  }, 0);
}

window.onload = fdg.f;

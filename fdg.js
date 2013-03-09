var fdg = {};
exports.fdg = fdg;

fdg.Vector = function() {
  this.x = 0;
  this.y = 0;
};

fdg.Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
};

fdg.Vector.prototype.diff = function(v) {
  return new fdg.Vector(this.x - v.x, this.y - v.y);
};

fdg.Vector.prototype.mult = function(s) {
  this.x *= s;
  this.y *= s;
};

fdg.Vector.prototype.len = function() {
  return fdg.util.pythagorean(this.x, this.y);
};
  

fdg.Vector.prototype.normalize = function() {
  var len = this.len();
  if (len == 0) {
    // Point vectors go North, arbitrarily.
    this.x = 0;
    this.y = 1;
  }
  this.x /= len;
  this.y /= len;
};

fdg.Vector.prototype.clone = function() {
  return new fdg.Vector(this.x, this.y);
};

fdg.Node = function(id) {
  this.id = id;
  this.p = new fdg.Vector(0, 0); // position;
  this.v = new fdg.Vector(0, 0); // velocity
  this.edges = {};
};

fdg.Node.prototype.distance = function(other) {
  var v = this.diff(other);
  return v.length();
};

fdg.Node.prototype.direction = function(other) {
  var v = this.diff(other);
  v.normalize();
  return v;
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
  for (var n in this.nodes) {
    var f = new fdg.Vector(0, 0); // forces
    // Update edge forces with Hooke's Law of Elasticity
    for (var e in n.edges) {
      var other = n.edges[e];
      var distance = n.distance(other);
      var sf = fdg.util.SC * (fdg.util.SL - distance);
      var dir = n.direction(other);
      dir.mult(sf);
      f.add(dir);
    }
    // Update layout forces.  (n^2, not n(n-1)/2. Close enough.)
    for (var i in this.nodes) {
      var other = this.nodes[i];
      var distance = n.distance(other);
      var dsquared = Math.pow(distance, 2);
      // TODO: Add internode gravity?
      var lf = fdg.util.L / dsquared;
      var dir = n.direction(other);
      dir.mult(gf + rf);
      f.add(dir);
    }
    // TODO: Add global gravity? (Down? Center?)
    // Apply friction.
    n.v.mult(Math.pow(0.95, ts));
    // Update velocity.
    f.mult(ts);
    n.v.add(f);
    // Move the node.
    var pd = n.v.clone();
    pd.mult(ts);
    n.p.add(pd);
    // TODO: Position event.
  };
};

fdg.util = {};
fdg.util.pythagorean = function(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};
fdg.util.SL = 1;
fdg.util.SC = 1;
fdg.util.FRICTION = 0.95;
fdg.util.LF = 1;

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

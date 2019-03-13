const uuid = require("uuid/v4");

module.exports = class DependencyGraph {
  constructor() {
    this.nodes = {};
    this.dependencies = {};
    this.dependents = {};
  }

  addNode(node) {
    node.uuid = uuid();
    this.nodes[node.uuid] = node;
    this.dependencies[node.uuid] = [];
    this.dependents[node.uuid] = [];
    return node;
  }

  removeNode(node) {
    if (this.nodes[node.uuid]) {
      delete this.nodes[node.uuid];
      delete this.dependencies[node.uuid];
      delete this.dependents[node.uuid];

      Object.keys(this.dependencies).forEach(k => {
        this.dependencies[k] = this.dependencies[k].filter(l => l !== k);
      });

      Object.keys(this.dependents).forEach(k => {
        this.dependents[k] = this.dependents[k].filter(l => l !== k);
      });
    }
  }

  addDependency(a, b) {
    this.dependents[a].push(b);
    this.dependencies[b].push(a);
  }

  removeDependency(a, b) {
    this.dependents = this.dependents[a].filter(l => l !== b);
    this.dependencies = this.dependents[b].filter(l => l !== a);
  }
};

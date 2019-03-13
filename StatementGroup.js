const DependencyGraph = require("./graph/DependencyGraph");

module.exports = class StatementGroup {
  constructor() {
    this.statementGraph = new DependencyGraph();
  }

  addStatement(statement) {
    const dependencies = statement.dependencies;
    delete statement.dependencies;
    statement.done = false;
    const uuid = this.statementGraph.addNode(statement).uuid;
    dependencies.forEach(d => this.statementGraph.addDependency(d, uuid));
    this.attemptProcessStatement(uuid);

    return uuid;
  }

  attemptProcessStatement(uuid) {
    if (this.statementGraph.nodes[uuid].done !== false) return;

    const dependencies = this.statementGraph.dependencies[uuid].map(
      d => this.statementGraph.nodes[d]
    );

    if (dependencies.filter(d => d.done === "rejected").length !== 0) {
      this.rejectStatement(uuid);
      return;
    }

    if (dependencies.filter(d => d.done === false).length !== 0) {
      return;
    }

    this.processStatement(uuid)
      .then(res => this.resolveStatement(uuid))
      .catch(err => this.rejectStatement(uuid));
  }

  processStatement(uuid) {
    return new Promise((resolve, reject) => {
      setTimeout(() => (this.statementGraph.nodes[uuid].shouldFail ? reject() : resolve()), 1000);
    });
  }

  resolveStatement(uuid) {
    console.log("Resolved " + Date.now() + " " + this.statementGraph.nodes[uuid].name);
    this.statementGraph.nodes[uuid].done = "resolved";
    this.statementGraph.dependents[uuid].forEach(d => {
      this.attemptProcessStatement(d);
    });
  }

  rejectStatement(uuid) {
    console.log("Rejected " + Date.now() + " " + this.statementGraph.nodes[uuid].name);
    this.statementGraph.nodes[uuid].done = "rejected";
    this.statementGraph.dependents[uuid].forEach(d => {
      this.attemptProcessStatement(d);
    });
  }
};

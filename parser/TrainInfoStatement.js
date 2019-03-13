class TrainInfoStatement {
  constructor(id, type, date) {
    this.type = "TRAIN_STATEMENT";
    this.data = {
      id,
      trainType: type,
      date
    };
  }

  extendWithElviraId(elviraId) {
    this.data.elviraId = elviraId;
  }

  extendWithRelation(relation) {
    this.data.relation = relation;
  }

  extendWithName(name) {
    this.data.name = name;
  }

  extendWithVisz(visz) {
    this.data.visz = visz;
  }

  static relBetween(from, to) {
    return { from, to };
  }
}

module.exports = TrainInfoStatement;

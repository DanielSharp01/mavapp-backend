module.exports = () => {
  return async (req, res, next) => {
    res.result = res.trainInstances.map(instance => {
      return {
        number: instance.train.number,
        elviraId: instance.elviraId,
        type: instance.train.type,
        name: instance.train.name,
        visz: instance.train.visz,
        status: instance.status,
        date: instance.date,
        position: instance.position,
        delay: instance.delay
      };
    });
    return next();
  }
}
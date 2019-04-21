module.exports = (objectRepository, status) => {
  return async (req, res, next) => {
    try {
      res.trainInstances = await objectRepository.TrainInstance.find(status ? { status } : {}).populate({ path: "train" });
    }
    catch (err) {
      return next(err);
    }
    return next();
  }
}
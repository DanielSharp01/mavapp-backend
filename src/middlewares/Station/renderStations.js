module.exports = () => {
  return (req, res, next) => {
    res.result = res.stations.map(station => {
      return {
        name: station.displayName,
        normName: station.normName,
        position: station.position,
        distance: station.distance
      };
    });
    return next();
  }
}
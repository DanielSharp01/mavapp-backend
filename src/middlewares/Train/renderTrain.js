module.exports = () => {
  return (req, res, next) => {
    let stations = res.stations.map(station => {
      return {
        name: station.mavName || (station.station && station.station.displayName),
        normName: station.normName,
        distance: station.distance || null,
        intDistance: station.intDistance !== -1 ? station.intDistance : null,
        platform: station.platform,
        position: station.station ? station.station.position : null,
        arrival: station.arrival || null,
        departure: station.departure || null
      };
    });

    let instance = res.instance ? {
      status: res.instance.status,
      date: res.instance.date,
      position: res.instance.position,
      delay: res.instance.delay
    } : null;

    res.result = {
      number: res.locals.train.number,
      elviraId: res.locals.train.elviraId,
      type: res.locals.train.type,
      name: res.locals.train.name,
      visz: res.locals.train.visz,
      polyline: res.locals.train.encodedPolyline,
      stations,
    }

    if (req.params.elviraId && req.params.elviraId.includes("_")) res.result.instance = instance;
    else res.result.instanceToday = instance;

    return next();
  }
}
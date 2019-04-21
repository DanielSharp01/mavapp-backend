module.exports = () => {
  return async (req, res, next) => {
    let stations = res.stations.map(station => {
      return {
        name: station.mavName || (station.station && station.station.displayName),
        distance: station.distance,
        intDistance: station.intDistance !== -1 ? station.intDistance : null,
        platform: station.platform,
        position: station.station ? station.station.position : undefined,
        arrival: station.arrival,
        departure: station.departure
      };
    });

    let instance = res.instance ? {
      status: res.instance.status,
      date: res.instance.date,
      position: res.instance.position,
      delay: res.instance.delay
    } : null;

    let response = {
      number: res.train.number,
      elviraId: res.train.elviraId,
      type: res.train.type,
      name: res.train.name,
      visz: res.train.visz,
      polyline: res.train.polyline,
      stations,
    }

    if (req.params.elviraId && req.params.elviraId.includes("_")) response.instance = instance;
    else response.instanceToday = instance;

    res.send(response);
  }
}
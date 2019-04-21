function stationSimplify(trainNumber, st, res) {
  return {
    name: st.mavName || (st.station && st.station.displayName),
    normName: st.normName,
    position: st.station ? st.station.position : null,
    previousStation: res.previousLinks[trainNumber + "." + st.normName],
    nextStation: res.nextLinks[trainNumber + "." + st.normName],
    distance: st.distance || null,
    intDistance: st.intDistance !== -1 ? st.intDistance : null,
    platform: st.platform,
    arrival: st.arrival || null,
    departure: st.departure || null,
  }
}

module.exports = () => {
  return (req, res, next) => {
    res.result = res.trains.map(train => {
      let instance = res.trainIntances[train.elviraId];
      instance = res.trainIntances[train.elviraId] ? {
        status: instance.status,
        date: instance.date,
        position: instance.position,
        delay: instance.delay
      } : null;

      let fromStation = stationSimplify(train.fromStation.trainNumber, train.fromStation, res);
      let toStation = stationSimplify(train.fromStation.trainNumber, train.toStation, res);

      return {
        number: train.number,
        elviraId: train.elviraId,
        type: train.type,
        name: train.name,
        visz: train.visz,
        fromStation: fromStation,
        toStation: toStation,
        instanceToday: instance
      };
    });
    return next();
  }
}
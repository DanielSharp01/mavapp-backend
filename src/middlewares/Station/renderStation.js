module.exports = () => {
  return (req, res, next) => {
    res.result = {
      name: res.station.displayName,
      normName: res.station.normName,
      position: res.station.position,
      trains: res.trainStations.map(st => {

        let instance = res.trainIntances[st.train.elviraId];
        instance = res.trainIntances[st.train.elviraId] ? {
          status: instance.status,
          date: instance.date,
          position: instance.position,
          delay: instance.delay
        } : null;

        return {
          number: st.train.number,
          elviraId: st.train.elviraId,
          type: st.train.type,
          name: st.train.name,
          visz: st.train.visz,
          previousStation: res.previousLinks[st.train.number],
          nextStation: res.nextLinks[st.train.number],
          distance: st.distance || null,
          intDistance: st.intDistance !== -1 ? st.intDistance : null,
          platform: st.platform,
          arrival: st.arrival || null,
          departure: st.departure || null,
          instanceToday: instance
        };
      })
    };
    return next();
  }
}
function parseTimeTuple(str) {
  if (typeof str == "string") str = str.trim();
  else return { scheduled: null, actual: null };

  if (str.length == 0) return { scheduled: null, actual: null };

  let scheduled = {
    h: parseInt(str[0]) * 10 + parseInt(str[1]),
    m: parseInt(str[3]) * 10 + parseInt(str[4])
  };
  let actual = str.length > 5 && {
    h: parseInt(str[5]) * 10 + parseInt(str[6]),
    m: parseInt(str[8]) * 10 + parseInt(str[9])
  };

  return { scheduled, actual: actual || null };
}

module.exports = { parseTimeTuple };

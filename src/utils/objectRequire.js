module.exports = function (obj, property) {
  let keys = property.split(".");
  let checkedKey = "";
  for (let key of keys) {
    checkedKey += checkedKey.length > 0 ? "." : "" + key;
    if (obj[key]) obj = obj[key];
    else throw new Error(`Required object key ${checkedKey} does not exist.`);
  }

  return obj;
}
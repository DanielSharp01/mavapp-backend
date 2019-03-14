Object.defineProperty(String.prototype, "replaceEmpty", {
  value: function replaceEmpty(def = undefined) {
    return this.length == 0 ? def : this.toString();
  }
});

function parseTimeTuple(elem) {
  const contents = elem.contents();
  let timeTuple = { actual: null };
  timeTuple.scheduled = contents.eq(0).text().trim().replaceEmpty(null);
  if (elem.contents().length >= 3)
    timeTuple.actual = contents.eq(2).text().trim().replaceEmpty(null);

  if (timeTuple.scheduled == null) return null;
  return timeTuple;
}

function fixJson(json) {
  // Courtesy of: https://stackoverflow.com/a/39050609/2132821
  return json.replace(/:\s*"([^"]*)"/g, (match, p1) => ': "' + p1.replace(/:/g, '@colon@') + '"')
    .replace(/:\s*'([^']*)'/g, (match, p1) => ': "' + p1.replace(/:/g, '@colon@') + '"')
    .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g, '"$2": ').replace(/@colon@/g, ':')
}

module.exports = { parseTimeTuple, fixJson };

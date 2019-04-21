module.exports = {
  mergeWithoutDuplicates: (arr) => {
    return [...new Set([].concat(...arr))];
  }
}
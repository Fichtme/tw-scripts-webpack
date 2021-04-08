export default class Page {
  static equals(parameters) {
    let count = 0;
    for (const [key, value] of Object.entries(parameters)) {
      count += (new URL(location.href).searchParams.get(key) == value) ? 1 : 0;
    }

    return count === Object.entries(parameters).length;
  }
}

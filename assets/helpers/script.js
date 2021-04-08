export default class Script {
  constructor(name) {
    this.name = name;
    const data = TribalWars.getGameData();

    this.scriptKey = `FICHTME-${data.world}-${this.name.toUpperCase()}`;
  }

  get settings() {
    const jsonData = localStorage.getItem(this.scriptKey);
    let data = {};
    if (jsonData) {
      data = JSON.parse(jsonData);
    }
    return data
  }

  getSetting(item, def = undefined) {
    if (this.settings[item]) {
      return this.settings[item];
    }
    return def;
  }

  isExecuted() {
    if (!window.executed_scripts) {
      window.executed_scripts = [];
    }

    let executed = true;
    if (!window.executed_scripts.includes(this.name)) {
      executed = false;
      window.executed_scripts.push(this.name);
    }

    return executed;
  }

  updateSettings(update) {
    localStorage.setItem(this.scriptKey, JSON.stringify(Object.assign(this.settings, update)));
  }

  updateSettingsByKey(key, value) {
    const obj = {};
    obj[key] = value;
    this.updateSettings(obj)
  }
}

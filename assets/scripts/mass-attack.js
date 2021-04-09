import Page from "../helpers/location";
import Script from "../helpers/script";

const script = new Script('mass-attack');

if (!script.isExecuted() && Page.equals({
  screen: 'overview_villages',
})) {
  executeScript();
}

function executeScript() {
  // #1 |  [unit]ram[/unit] [b][color=#ff0000]Clear[/color][/b] | 2021-04-16 [b]14:01:00.000[/b] | 2021-04-16 14:01:00.000 | 543|524 -> 543|524 | [url=game.php?village=2548&screen=place&target=2548]Attack[/url]
}

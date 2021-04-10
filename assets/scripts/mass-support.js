import Page from "../helpers/location";
import Script from "../helpers/script";
import { TwMessage } from "../helpers/tw-message";
import StateManager from "../helpers/state-manager";

class massSupport {
  constructor() {
    this.units = [];

    this.render();
    document.querySelector('#FICHTME_DISTANCE_MIN').addEventListener('change', this.onInputUpdate.bind(this))
    document.querySelector('#FICHTME_DISTANCE_MAX').addEventListener('change', this.onInputUpdate.bind(this))
    document.querySelector('#FICHTME_FILL_SUPPORT').addEventListener('click', this.onFillSupportClick.bind(this))
    document.querySelectorAll('.FICHTME_units_groups').forEach((element) => {
      element.addEventListener('change', this.onInputUpdate.bind(this))
    })

    document.querySelectorAll('.FICHTME_units_total').forEach((element) => {
      element.addEventListener('change', this.onInputUpdate.bind(this))
    });

    this.initState = {
      totalNeeded: {},
      groupsNeeded: {},
      selected: {},
    }

    this.state = new StateManager(this.initState);
    this.state.listen("selected", this.onSelectedUpdate.bind(this));
  }

  onInputUpdate(event) {
    script.updateSettingsByKey(event.target.name, event.target.value);
  }

  onSelectedUpdate() {
    this.missingTroopsMessage();
    this.renderMissingTroops();
  }

  onFillSupportClick(event) {
    event.preventDefault();
    const filterElement = document.getElementById('FICHTME_DEF_FILTER');

    const minDistance = parseFloat(script.getSetting('minDistance', 0));
    const maxDistance = parseFloat(script.getSetting('maxDistance', 500));
    let totalNeeded = [];
    let groupsNeeded = [];

    filterElement.querySelectorAll('.FICHTME_units_total').forEach((element, index) => {
      totalNeeded.push(parseInt(element.value));
    })
    filterElement.querySelectorAll('.FICHTME_units_groups').forEach((element, index) => {
      groupsNeeded.push(parseInt(element.value));
    })

    const troopListElement = document.getElementById('village_troup_list');
    let finished = false;
    let selected = {};

    troopListElement.querySelector("tbody").querySelectorAll('tr').forEach((element) => {
      const distance = parseFloat(element.querySelector('td:nth-of-type(2)').textContent);
      const troopTds = element.querySelectorAll('td[data-unit]');
      let enoughTroops = true;

      for (let y = 0; y < troopTds.length; y++) {
        if (parseInt(troopTds[y].textContent) < groupsNeeded[y]) {
          enoughTroops = false;
        }
      }

      const checkboxElement = element.querySelector('.troop-request-selector');
      if (!finished && distance >= minDistance && distance <= maxDistance && checkboxElement.checked) {
        troopTds.forEach((element, index) => {
          if (selected[index] === undefined) {
            selected[index] = 0
          }
          let addedUnits = 0;

          let available = parseInt(element.querySelector('input').value) | 0;
          if (available < groupsNeeded[index]) {
            addedUnits = available;
          } else {
            addedUnits = groupsNeeded[index];
          }

          if (addedUnits > totalNeeded[index]) {
            addedUnits = totalNeeded[index];
          } else if ((selected[index] + addedUnits) > totalNeeded[index]) {
            addedUnits = totalNeeded[index] - selected[index];
          }

          element.querySelector('input').value = addedUnits;
          selected[index] += addedUnits;
          if (selected[index] === totalNeeded[index] && addedUnits > 0) {
            enoughTroops = true;
          }
        })
      }
    });

    this.state.set({
      totalNeeded: totalNeeded,
      selected: selected,
    });

  }

  renderSupportTable(minDistance, maxDistance) {
    const table = document.createElement('table');
    table.id = 'FICHTME_DEF_FILTER';
    table.className = 'vis overview_table';
    table.style = 'width:100%;';
    table.innerHTML = '<thead>' +
      '<th></th><th>Afstand</th>' +
      '</thead>' +
      '<tbody>' +
      '<tr>' +
      '<td>totaal nodig</td>' +
      '<td><input type="number" value="' + (minDistance) + '" name="minDistance" id="FICHTME_DISTANCE_MIN" style="width: 45px;"/></td>' +
      '</tr>' +
      '<tr>' +
      '<td>In groepen van</td>' +
      '<td><input type="number" value="' + (maxDistance) + '" name="maxDistance" id="FICHTME_DISTANCE_MAX" style="width: 45px;"/></td>' +
      '</tr>' +
      '</tbody>';
    return table;
  }

  render() {
    const troopListElement = document.getElementById('village_troup_list');
    const settings = script.settings;

    troopListElement.before(
      this.renderSupportTable(
        script.getSetting('minDistance', 0),
        script.getSetting('maxDistance', 500),
      )
    );
    const units = troopListElement.querySelector("thead").querySelectorAll('th input.unit_checkbox')
    const unitCount = units.length;
    units.forEach(el => {
      const unit = el.closest("th").cloneNode(true)
      unit.removeChild(unit.querySelector('input'))
      document.querySelector('#FICHTME_DEF_FILTER thead tr').append(unit);
    });


    const defFilterElement = document.querySelectorAll('#FICHTME_DEF_FILTER tbody tr');

    units.forEach((element) => {
      const unitName = element.id.replace('checkbox_', '');
      this.units.push(unitName);
      let totalValue = 0;
      const totalName = `total-${unitName}`;
      if (settings[totalName]) {
        totalValue = settings[totalName];
      }

      let groupValue = 0;
      const groupName = `group-${unitName}`;
      if (settings[groupName]) {
        groupValue = settings[groupName];
      }

      defFilterElement[0].insertAdjacentHTML(
        'beforeend',
        `<td><input type="number" name="${totalName}" value="${totalValue}" class="FICHTME_units_total call-unit-box"/></td>`
      )

      defFilterElement[1].insertAdjacentHTML(
        'beforeend',
        `<td><input type="number" name="${groupName}" value="${groupValue}" class="FICHTME_units_groups call-unit-box" /></td>`
      )
    });

    document.querySelector('#FICHTME_DEF_FILTER tbody').insertAdjacentHTML(
      'beforeend',
      `<tr><td colspan="${unitCount + 2}">
            <input type="button" id="FICHTME_FILL_SUPPORT" class="btn call_button" value="Invullen" style="float:right;"/>
          </td></tr>`
    );
  }

  missingTroopsMessage() {
    const {totalNeeded, selected} = this.state.all
    for (let i = 0; i < totalNeeded.length; i++ )
    {
      if (selected[i] !== totalNeeded[i]) {
        TwMessage.Error(`NOT enough troops available! ${this.units[i]} missing: ${totalNeeded[i] - selected[i]}`);
      }
    }
  }

  renderMissingTroops() {
    const {supportSumRendered, totalNeeded, selected} = this.state.all

    if (!supportSumRendered) {
      const supportSum = document.getElementById('support_sum').cloneNode(true);
      supportSum.id = "FICHTME_OS_OVERVIEW";
      this.state.set({supportSumRendered: true})
      document.getElementById('place_call_form').prepend(supportSum)
    }

    const elements = document.getElementById('FICHTME_OS_OVERVIEW').querySelectorAll('tbody tr td');
    let missing = 0;
    elements.forEach((el, i) => {
      if ((elements.length - 1) === i) {
        if (missing > 0) {
          el.style.backgroundColor = 'red';
          el.style.color = 'white';
        }
        el.textContent = missing;
      } else {
        let total = totalNeeded[i] - selected[i];
        if (total > 0) {
          el.style.backgroundColor = 'red';
          el.style.color = 'white';
        }
        el.textContent = (total).toString();
        missing += total;
      }
    });
  }
}

const script = new Script('mass-support');

if (!script.isExecuted('mass-support') && Page.equals({
  mode: 'call',
  screen: 'place',
})) {
  window.massSupport = new massSupport();
}

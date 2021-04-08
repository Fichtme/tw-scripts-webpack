import Page from "../helpers/location";
import Script from "../helpers/script";

const script = new Script('mass-support');

if (!script.isExecuted('mass-support') && Page.equals({
  mode: 'call',
  screen: 'place',
})) {
  executeScript();
}

function executeScript() {
  render();

  document.querySelector('#FICHTME_DISTANCE_MIN').addEventListener('change', onUpdate)
  document.querySelector('#FICHTME_DISTANCE_MAX').addEventListener('change', onUpdate)
  document.querySelector('#FICHTME_FILL_SUPPORT').addEventListener('click', onFillSupportClick)
  document.querySelectorAll('.FICHTME_units_groups').forEach((element) => {
    element.addEventListener('change', onUpdate)
  })

  document.querySelectorAll('.FICHTME_units_total').forEach((element) => {
    element.addEventListener('change', onUpdate)
  });

}

function onUpdate(event) {
  script.updateSettingsByKey(event.target.name, event.target.value);
}

function onFillSupportClick(event) {
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
    if (!finished && distance >= minDistance && distance <= maxDistance && enoughTroops) {
      if (!checkboxElement.checked) {
        checkboxElement.click();
      }

      troopTds.forEach((element, index) => {
        if (selected[index] === undefined) {
          selected[index] = 0
        }

        let addedUnits = groupsNeeded[index];

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
    } else {
      if (checkboxElement.checked) {
        checkboxElement.click();
      }
    }
  });
}

function render() {
  const troopListElement = document.getElementById('village_troup_list');
  const settings = script.settings;

  troopListElement.before(
    getSupportTable(
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

function getSupportTable(minDistance, maxDistance) {
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

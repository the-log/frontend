import { LitElement, html, css, unsafeCSS, PropertyValueMap } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import "./playerCard";
import "./inputSwitch";
import { LogPlayerCard } from "./playerCard";
import formatMoney from "../utilities/formatMoney";
import { Player } from "../types/defs";
import basestyles from "bundle-text:../../styles/all.scss";
import { dots } from "../utilities/icons";
import { unsafeHTML } from "lit/directives/unsafe-html";

interface FormValues extends HTMLFormControlsCollection {
  name: HTMLInputElement;
  available: RadioNodeList;
  rookie: RadioNodeList;
  position: HTMLSelectElement;
  team: HTMLSelectElement;
}

@customElement('log-players')
export class LogPlayers extends QueryMixin(LitElement) {

  @state()
  playerCount = 0;

  @state()
  playerData: Player[] = [];

  @property({attribute: false})
  queryVariables: string = JSON.stringify({
    take: 50,
    skip: 0,
    filters: {},
    order: {pointsLastYear: "desc"}
  });

  sortTable(event: PointerEvent) {
    const sortBy = (event.target as Element)?.getAttribute('sortby');

    if (!sortBy) return;

    switch (sortBy) {
      case 'name':
        break;

      case 'position':
        break;

      case 'nflteam':
        break;

      default:
        break;
    }
  }

  playerSearchFormSubmit(e: SubmitEvent) {
    const {queryVariables} = this;

    const vars = JSON.parse(queryVariables);

    const form = e.currentTarget as HTMLFormElement;

    function yesNoNull(stringVal: string): boolean | null {
      const map: any = {
        'yes': true,
        'no': false,
        'either': null,
      }
      return map[stringVal]
    }

    let {
      name: {
        value: nameString
      },
      available: {
        value: availableString
      },
      rookie: {
        value: rookieString
      },
      position: {
        value: positionString
      },
      team: {
        value: teamString
      }
    } = form.elements as FormValues;

    const nameValue = nameString || null;
    const availableValue = yesNoNull(availableString);
    const rookieValue = yesNoNull(rookieString);
    const positionValue = positionString || null;
    const teamValue = teamString || null;

    if (nameValue) {
      vars.filters.name = {
        contains: nameValue,
        mode: 'insensitive'
      };
    } else {
      delete vars.filters.name;
    }

    switch (availableValue) {
      case true:
        vars.filters.contract = null
        break;

      case false:
        vars.filters.contract = {}
        break;

      default:
        delete vars.filters.contract;
        break;
    }

    switch (rookieValue) {
      case true:
        vars.filters.isRookie = {
          equals: true,
        }

        break;

      case false:
        vars.filters.isRookie = {
          equals: false,
        }

        break;

      default:
        delete vars.filters.isRookie;
        break;
    }

    if (positionValue) {
      vars.filters.position = {
        equals: positionValue
      };
    } else {
      delete vars.filters.position;
    }

    if (teamValue) {
      vars.filters.team = {
        equals: teamValue
      }
    } else {
      delete vars.filters.team;
    }

    this.queryVariables = JSON.stringify(vars);
  }

  render() {
    const {filters} = JSON.parse(this.queryVariables);

    const contractStatus = filters?.contract || 'either';

    return html`
      <form
        class="panel"
        @submit=${(e: SubmitEvent) => e.preventDefault()}
        @change=${this.playerSearchFormSubmit}
      >
        <label htmlFor="name">Player Name</label>
        <input type="text" name="name" placeholder="Player Name">

        <fieldset>
          <legend>Available</legend>
          <input type="radio" name="available" id="available-yes" value="yes">
          <label for="available-yes">Yes</label>
          <input type="radio" name="available" id="available-no" value="no">
          <label for="available-no">No</label>
          <input type="radio" name="available" id="available-either" value="either" checked>
          <label for="available-either">Either</label>
        </fieldset>

        <fieldset>
          <legend>Rookie Status</legend>
          <input type="radio" name="rookie" id="rookie-yes" value="yes">
          <label for="rookie-yes">Yes</label>
          <input type="radio" name="rookie" id="rookie-no" value="no">
          <label for="rookie-no">No</label>
          <input type="radio" name="rookie" id="rookie-either" value="either" checked>
          <label for="rookie-either">Either</label>
        </fieldset>

        <select name="position" id="position">
          <option value="" selected>Any Position</option>
          <option value="QB">Quarterback</option>
          <option value="RB">Running Back</option>
          <option value="WR">Wide Receiver</option>
          <option value="TE">Tight End</option>
          <option value="FLEX">Offensive Flex</option>
          <option value="K">Kicker</option>
          <option value="DL">Defensive Line</option>
          <option value="LB">Linebacker</option>
          <option value="DB">Defensive Back</option>
          <option value="DP">Defensive Flex</option>
        </select>

        <select id="team" name="team">
          <option value="" selected>Any Team</option>
          <option value="ARI">Arizona Cardinals</option>
          <option value="ATL">Atlanta Falcons</option>
          <option value="BAL">Baltimore Ravens</option>
          <option value="BUF">Buffalo Bills</option>
          <option value="CAR">Carolina Panthers</option>
          <option value="CHI">Chicago Bears</option>
          <option value="CIN">Cincinatti Bengals</option>
          <option value="CLE">Cleveland Browns</option>
          <option value="DAL">Dallas Cowboys</option>
          <option value="DEN">Denver Broncos</option>
          <option value="DET">Detroit Lions</option>
          <option value="GB">Green Bay Packers</option>
          <option value="HOU">Houston Texans</option>
          <option value="IND">Indianapolis Colts</option>
          <option value="JAX">Jacksonville Jaguars</option>
          <option value="KC">Kansas City Cheifs</option>
          <option value="LAC">Los Angeles Chargers</option>
          <option value="LAR">Los Angeles Rams</option>
          <option value="MIA">Miami Dolphins</option>
          <option value="MIN">Minnesota Vikings</option>
          <option value="NE">New England Patriots</option>
          <option value="NO">New Orleans Saints</option>
          <option value="NYG">New York Giants</option>
          <option value="NYJ">New York Jets</option>
          <option value="OAK">Las Vegas Raiders</option>
          <option value="PHI">Philadelphia Eagles</option>
          <option value="PIT">Pittsburgh Steelers</option>
          <option value="SEA">Seattle Seahawks</option>
          <option value="SF">San Francisco 49ers</option>
          <option value="TB">Tampa Bay Buccaneers</option>
          <option value="TEN">Tennessee Titans</option>
          <option value="WSH">Washington Commanders</option>
          <option value="FA">Free Agent</option>
        </select>
      </form>
      <div class="panel">
        <table>
          <thead @click=${this.sortTable}>
            <tr>
              <th sortby="name">Player</th>
              <th sortby="position">Position</th>
              <th sortby="nflteam">NFL Team</th>
              <th>LOG Team</th>
              <th>Salary</th>
              <th>Years</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${this.playerData.map(player => html`
              <tr>
                <td>${player.name}</td>
                <td>${player.position}</td>
                <td>${player.team}</td>
                <td>${player.contract?.team?.name}</td>
                <td>${formatMoney(player.contract?.salary)}</td>
                <td>${player.contract?.years}</td>
                <td>
                <button class="icon" contractType="${status}" @click="${(e: Event) => {
                  const thisRow = (e.target as HTMLElement).closest('tr');
                  const nextRow = thisRow?.nextElementSibling! as HTMLElement;

                  if (nextRow.hidden) {
                    (nextRow.querySelector('log-player-card') as LogPlayerCard)!.getPlayerInfo();
                  }
                  nextRow.hidden = !nextRow.hidden;

                }}">
                  ${dots('1em', '1em')}
                </button>
                </td>
              </tr>
              <tr hidden>
                <td colspan="999">
                  <log-player-card .player=${player}></log-player-card>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    const {queryVariables} = this;

    this.runQuery(Queries["all-players"], JSON.parse(queryVariables))
      .then(({data}) => {
        this.playerCount = data.playerCount;
        this.playerData = data.players;
      });
  }

  updated(changedProperties: Map<PropertyKey, unknown>) {
    if (changedProperties.has('queryVariables')) {
      const {queryVariables} = this;

      this.runQuery(Queries["all-players"], JSON.parse(queryVariables))
        .then(({data}) => {
          this.playerCount = data.playerCount;
          this.playerData = data.players;
        });
    }
  }

  static styles = css`
    ${unsafeCSS(basestyles)}
  `

}

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
    e.preventDefault();

    const {queryVariables} = this;

    const vars = JSON.parse(queryVariables);

    // @ts-ignore
    const input = (e.target! as HTMLFormElement).elements.name.value;
    Object.assign(vars.filters, {name: {contains: input, mode: 'insensitive'}});
    this.queryVariables = JSON.stringify(vars);
  }

  render() {
    const {filters} = JSON.parse(this.queryVariables);

    const contractStatus = filters?.contract || 'either';

    return html`
      <form class="panel" @submit="${this.playerSearchFormSubmit}">
        <label htmlFor="name">Player Name</label>
        <input type="text" name="name" placeholder="Player Name">
        <input type="submit" value="submit" hidden>
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

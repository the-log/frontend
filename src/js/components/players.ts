import { LitElement, html, css } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import formatMoney from "../utilities/formatMoney";
import { Player } from "../types/defs";

@customElement('log-players')
export class LogPlayers extends QueryMixin(LitElement) {

  @state()
  playerCount = 0;

  @state()
  page = 0;

  @state()
  playerData: Player[] = [];

  @state()
  sortProperty?: string | null;

  @state()
  sortAsc = true;

  @state()
  queryVariables?: any;

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
    console.log(e.target);
  }

  render() {
    return html`
      <form @submit="${this.playerSearchFormSubmit}">
        <input type="text" name="name" placeholder="Player Name">
        <input type="submit" value="submit" hidden>
      </form>
      <table>
        <thead @click=${this.sortTable}>
          <tr>
            <th sortby="name">Player</th>
            <th sortby="position">Position</th>
            <th sortby="nflteam">NFL Team</th>
            <th>LOG Team</th>
            <th>Salary</th>
            <th>Years</th>
          </tr>
        </thead>
        <tbody>
          ${this.playerData.map(player => html`
            <tr>
              <td>${player.name}</td>
              <td>${player.position}</td>
              <td>${player.team}</td>
              <td>${player.contract?.team?.name}</td>
              <td align="right">${formatMoney(player.contract?.salary)}</td>
              <td>${player.contract?.years}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.runQuery(Queries["all-players"])
      .then(({data}) => {
        this.playerCount = data.playerCount;
        this.playerData = data.players;
      });
  }

  static styles = css`
    table {
      text-align: left;
      border-collapse: collapse;
    }

    tbody tr:nth-child(2n) {
      background-color: #ccc;
    }

    td, th {
      padding: 0.25rem 0.5rem;
    }

    th {
      padding-bottom: 1rem;
      cursor: pointer;
    }
  `

}

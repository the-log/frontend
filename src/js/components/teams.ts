import { LitElement, html, css, PropertyValueMap, unsafeCSS} from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import formatMoney from "../utilities/formatMoney";
import { Contract, EVENTS, Team } from "../types/defs";
import { setPageTitle } from "./dashboard";
import basestyles from "bundle-text:../../styles/all.scss";
import { dots } from "../utilities/icons";
import "./playerCard";
import { LogPlayerCard } from "./playerCard";

@customElement('log-teams')
export class LogTeams extends QueryMixin(LitElement) {
  @state()
  teams: Team[] = [];

  @state()
  team?: Team;

  @state()
  contracts: Contract[] = [];

  @state()
  teamAbbr?: String | null;

  @property({attribute: 'my-team', type: Boolean})
  myTeam = false;

  @state()
  allowRender = true;

  updateTeamAbbr(_event: CustomEvent) {
    if (!this.myTeam) return;

    const dashboard = this.closest('log-dashboard');
    const teamFromAuth = (dashboard as LogDashboard)?.user?.team?.abbreviation;
    this.teamAbbr = teamFromAuth || null;
    this.allowRender = Boolean(teamFromAuth);
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(EVENTS.didUpdateLoginStatus, (this.updateTeamAbbr.bind(this) as EventListener));

    const { myTeam } = this;
    // Prevent render before abbr is populated
    if (myTeam) this.allowRender = false;
    // Use use team abbr from path
    if (!myTeam) this.teamAbbr = location.pathname.substring(1).split('/')[1] || null;
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (changedProperties.has('teamAbbr')) {
      const { teamAbbr } = this;

      if (teamAbbr) {
        this.runQuery(Queries["contracts-by-team"], {"abbr": teamAbbr})
          .then(({data}) => {
            this.team = data.team
            this.contracts = data.contracts

            this.dispatchEvent(setPageTitle(this.myTeam ? 'My Team' : data.team.name));
          })
      } else {
        this.runQuery(Queries["all-teams"])
          .then(({data}) => {
            this.teams = data.teams
          });
        this.dispatchEvent(setPageTitle('All Teams'))
      }
    }
  }

  renderAllTeams() {
    return html`
      <div class="panel">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Record</th>
              <th>Salary</th>
              <th>Years</th>
              <th>Active</th>
              <th>DTS</th>
              <th>IR</th>
              <th>Waived</th>
            </tr>
          </thead>
          <tbody>
            ${this.teams.map(team => {
              const {name, abbreviation: abbr, wins, losses, ties, contractTotals} = team
              const {salary, years, active, dts, ir, waived} = contractTotals;
              return html`
                <tr>
                  <td><a href="/teams/${abbr}">${name}</a></td>
                  <td>${wins}-${losses}-${ties}</td>
                  <td>${formatMoney(salary)}</td>
                  <td>${years}</td>
                  <td>${active}</td>
                  <td>${dts}</td>
                  <td>${ir}</td>
                  <td>${waived}</td>
                </tr>
              `
            })}
          </tbody>
        </table>
      </div>
    `
  }

  renderRoster(title: string, contracts: Contract[]) {
    if (!contracts.length) return;

    const { myTeam } = this;

    return html`
      <div class="panel">
        <h2>${title}</h2>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Years</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${contracts
              .sort((a: Contract, b: Contract) => {
                const posWeightA = a.player?.positionWeight + 1 || 999;
                const posWeightB = b.player?.positionWeight + 1 || 999;

                if (posWeightA > posWeightB) return 1;
                if (posWeightA < posWeightB) return -1;
                return 0;
              })
              .map((contract: Contract) => {
              const { player, salary, years, status } = contract
              const { name, team, position } = player || {};
              return html`
                <tr class="player-overview">
                  <td>${name}</td>
                  <td>${team}</td>
                  <td>${position}</td>
                  <td>${formatMoney(salary)}</td>
                  <td>${years}</td>
                  <td>
                    ${this.renderActions(contract)}
                  </td>
                </tr>
                <tr class="player-details" hidden>
                  <td colspan="999">
                    <log-player-card .player=${player}></log-player-card>
                  </td>
                </tr>
              `
            })}
          </tbody>
        </table>
      </div>
    `
  }

  renderActions(contract: Contract) {
    const {
      status,
      player: {
        name,
      }
    } = contract;

    return html`
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
    `
  }

  renderOneTeam() {
    const {team, contracts} = this;
    const {
      active,
      dts,
      ir,
      waived,
      salary,
      years
    } = team?.contractTotals || {};

    const activeContracts = contracts.filter(({status}) => status === 'active');
    const dtsContracts = contracts.filter(({status}) => status === 'dts');
    const irContracts = contracts.filter(({status}) => status === 'ir');
    const waivedContracts = contracts.filter(({status}) => status === 'waived');

    return html`
      <div class="panel">
        <h2>Contract Totals</h2>
        <ul>
          <li>Active: ${active}</li>
          <li>DTS: ${dts}</li>
          <li>IR: ${ir}</li>
          <li>Waived: ${waived}</li>
          <li>Salary: ${formatMoney(salary)} (${formatMoney(100000 - (salary || 0))} remaining)</li>
          <li>Years: ${years}</li>
        </ul>
      </div>

      ${this.renderRoster('Active Contracts', activeContracts)}

      ${this.renderRoster('Developmental Taxi Squad', dtsContracts)}

      ${this.renderRoster('Injured Reserve', irContracts)}

      ${this.renderRoster('Waivers', waivedContracts)}
    `
  }

  render() {

    if (!this.allowRender) return;

    if (this.teamAbbr) {
      return this.renderOneTeam()
    } else {
      return this.renderAllTeams()
    }
  }

  static styles = css`
    ${unsafeCSS(basestyles)}
  `
}

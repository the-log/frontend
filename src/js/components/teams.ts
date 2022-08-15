import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import formatMoney from "../utilities/formatMoney";
import { Contract, EVENTS, Team } from "../types/defs";
import { LogDashboard } from "./dashboard";

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
            console.log(data);

            this.team = data.team
            this.contracts = data.contracts
          })
      } else {
        this.runQuery(Queries["all-teams"])
          .then(({data}) => {
            this.teams = data.teams
          });
      }
    }
  }

  renderAllTeams() {
    return html`
      <h1>TEAMS</h1>
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
    `
  }

  renderRoster(title: string, contracts: Contract[]) {
    if (!contracts.length) return;

    const { myTeam } = this;

    return html`
      <h2>${title}</h2>
      <table>
        <thead>
          <tr>
            <th>Player</th>
            <th>Team</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Years</th>
            <th style="${!myTeam ? 'display:none;' : ''}">Actions</th>
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
              <tr>
                <td>${name}</td>
                <td>${team}</td>
                <td>${position}</td>
                <td>${formatMoney(salary)}</td>
                <td>${years}</td>
                <th style="${!myTeam ? 'display:none;' : ''}">
                  <button type="${status}" @click="${(e) => {e.target.nextElementSibling.showModal()}}">Test</button>
                  <dialog @focusout="${(e) => {
                    console.log(e.relatedTarget, e)
                  }}">
                    <h1>${name}</h1>
                    <p>Lorem ipsum dolor sit amet.</p>
                    <a href="#!">Link</a>
                    <button>Button</button>
                    <input type="text" />
                  </dialog>
                </th>
              </tr>
            `
          })}
        </tbody>
      </table>
    `
  }

  renderOneTeam() {
    const {myTeam, team, contracts} = this;
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
      <h1>${myTeam ? 'My Team' : team?.name}</h1>
      <h2>Contract Totals</h2>
      <ul>
        <li>Active: ${active}</li>
        <li>DTS: ${dts}</li>
        <li>IR: ${ir}</li>
        <li>Waived: ${waived}</li>
        <li>Salary: ${formatMoney(salary)} (${formatMoney(100000 - (salary || 0))} remaining)</li>
        <li>Years: ${years}</li>
      </ul>

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
}

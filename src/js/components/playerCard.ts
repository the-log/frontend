import { LitElement, html, css, PropertyValueMap, unsafeCSS } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import { Player } from "../types/defs";
import basestyles from "bundle-text:../../styles/all.scss";
import componentstyles from "bundle-text:../../styles/components/player-card.scss"

@customElement('log-player-card')
export class LogPlayerCard extends QueryMixin(LitElement) {

  @property({attribute: 'player'})
  player?: Player;

  @state()
  bio?: any;

  @state()
  stats?: any;

  getJSON = async (path: string) => {
    return fetch(`https://site.web.api.espn.com${path}`)
      .then(r => r.json())
      .catch(err => console.error(err.message))
  }

  getPlayerInfo = async () => {
    const { player, getJSON, runQuery } = this;
    if (!player) return;

    const {espn_id: id} = player;

    const {athlete} = await getJSON(`/apis/common/v3/sports/football/nfl/athletes/${id}`);
    const {data} = await runQuery(Queries['stats-by-player'], {id: id});

    this.bio = athlete;
    this.stats = data.player.fullStats;
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
  }

  render() {
    const { bio } = this;
    return html`
      <div
        class="headshot"
        style="
          --color:#${bio?.team?.color || '444'};
          --image:url('${bio?.team?.logos[0].href}');
        "
      >
        <img
          width="175"
          height="175"
          src=${bio?.headshot?.href}
          alt="${bio?.fullName} headshot"
        />
      </div>
    `
  }

  static styles = css`
    ${unsafeCSS(basestyles)}
    ${unsafeCSS(componentstyles)}
  `;
}

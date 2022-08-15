import { LitElement, html, css } from "lit";
import { customElement, property } from 'lit/decorators.js';

@customElement('log-menu')
export class LogMenu extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    console.log('log menu');

  }
  render() {
    return html`
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/teams">Teams</a></li>
        <li><a href="/players">Players</a></li>
        <li><a href="/">Transactions</a></li>
        <li><a href="/rulebook">Rulebook</a></li>
      </ul>
    `;
  }
}

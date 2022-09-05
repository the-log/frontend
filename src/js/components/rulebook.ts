import { LitElement, html, css, PropertyValueMap, unsafeCSS } from "lit";
import {unsafeHTML} from "lit/directives/unsafe-html";
import { customElement, property, state } from 'lit/decorators.js';
import markdown from '@wcj/markdown-to-html';
import basestyles from "bundle-text:../../styles/all.scss";

@customElement('log-rulebook')
export class LogRulebook extends LitElement {

  @state()
  tableOfContents?: any;

  @state()
  pages: any[] = [];

  fetchAllPages(pages: any) {
    const fetchedPages: any[] = [];

    pages.forEach((page: any) => {
      fetchedPages.push(fetch(page.download_url).then(r => r.text()))
    });

    Promise.all(fetchedPages).then(parsedPages => {
      this.pages = [...parsedPages];
    })
  }

  connectedCallback() {
    super.connectedCallback();

    fetch('https://api.github.com/repos/the-log/rulebook/contents/')
      .then(r => r.json())
      .then(data => this.tableOfContents = data);
  }

  render() {
    return html`
      <h1>The League of Ordinary Gentlemen Rulebook</h1>
      ${this.pages.map(page => html`
        <div class="panel">
          ${unsafeHTML((markdown(page) as string))}
        </div>
      `)}
    `
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (changedProperties.has('tableOfContents')) {
      this.fetchAllPages(this.tableOfContents);
    }
  }

  static styles = css`
    ${unsafeCSS(basestyles)}
  `;
}

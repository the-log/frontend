import { LitElement, html, css, PropertyValueMap, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import { EVENTS, AuthenticatedUser } from "../types/defs";
import { home, banner, helmet, transaction, rules, logout, menu } from "../utilities/icons";
import basestyles from "bundle-text:../../styles/all.scss";
import componentStyles from "bundle-text:../../styles/components/dashboard.scss";

interface FormSubmitValues extends HTMLFormControlsCollection {
  email?: HTMLInputElement;
  password?: HTMLInputElement;
}

const localStorageKey = 'the-log-navIsOpen';

const updatePageTitleEvent = 'updatePageTitle';

export function setPageTitle(newTitle: String) {
  return new CustomEvent(updatePageTitleEvent, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: {
      'title': newTitle,
    }
  });
}

@customElement('log-dashboard')
export class LogDashboard extends QueryMixin(LitElement) {

  @property({attribute: false, type: Boolean, reflect: true})
  private _navOpen?: Boolean;

  @property({attribute: false})
  private _isLoggedIn?: Boolean | undefined;

  @property({attribute: false})
  user?: AuthenticatedUser;

  @property({attribute:'title', reflect: false})
  pageTitle?: string;

  private eventUpdateLoginStatus = new CustomEvent(EVENTS.didUpdateLoginStatus, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: this.user,
  });

  private _checkLoginStatus() {
    this.runQuery(Queries['authenticated-item'])
      .then(({data}) => {
        const {dispatchEvent, eventUpdateLoginStatus} = this;
        const isLoggedIn = Boolean(data.authenticatedItem);

        this._isLoggedIn = isLoggedIn;
        this.user = isLoggedIn ? data.authenticatedItem : undefined
      });
  }

  private _authFormSubmit(event: SubmitEvent) {
    event.preventDefault();

    const fields: FormSubmitValues = (event!.target as HTMLFormElement)!.elements;

    this.runQuery(Queries['begin-session'], {
      "identity": fields.email?.value,
      "secret": fields.password?.value,
    }).then(({data}) => {
      if (data.hasOwnProperty('authenticateUserWithPassword')) {
        this._isLoggedIn = Boolean(data.item);

        if (this._isLoggedIn) {
          this.user = data.item;
        }
      }

      this._checkLoginStatus();
    })
  }

  private _endSession() {
    this.runQuery(Queries["end-session"])
      .then(({data}) => {
        if (data.endSession) {
          this._checkLoginStatus();
        }
      });
  }

  private _toggleNavTray() {
    const isOpen = this._navOpen;

    if (isOpen) {
      localStorage.removeItem(localStorageKey);
    } else {
      localStorage.setItem(localStorageKey, 'true');
    }

    this._navOpen = !isOpen;
    this.classList.toggle('nav-closed');
  }

  connectedCallback() {

    super.connectedCallback();

    const prefersNavOpen = Boolean(localStorage.getItem(localStorageKey));
    this._navOpen = prefersNavOpen;
    this.classList.toggle('nav-closed', prefersNavOpen);

    // Check authentication status on page load
    this._checkLoginStatus();

    // Allow event to trigger UI update
    this.addEventListener(
      EVENTS.doUpdateLoginStatus,
      this._checkLoginStatus.bind(this)
    );

    // Prevent form submissions from triggering page reload.
    this.addEventListener('submit', (e) => {e.preventDefault()})
    //this.addEventListener('submit', onLogin, true);

    this.addEventListener(updatePageTitleEvent, (event) => {
      // @ts-ignore
      this.pageTitle = event.detail.title;
    });
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (changedProperties.has('user')) {

      const { dispatchEvent, eventUpdateLoginStatus } = this;
      // Allow other components to respond to auth status changes.
      setTimeout(() => {
        dispatchEvent(eventUpdateLoginStatus);
      }, 0);
    }
  }

  renderLogIn = () => {
    return html`
      <div class="form-wrapper">
        <form @submit=${this._authFormSubmit}>
          <div class="field-wrapper">
            <label for="email">Email Address</label>
            <input type="email" name="email" placeholder="Email Address" autocomplete="email"/>
          </div>

          <div class="field-wrapper">
            <label for="password">Password</label>
            <input type="password" name="password" placeholder="Password" autocomplete="current-password"/>
          </div>


          <button type="submit">Log In</button>
        </form>
      </div>
    `
  };

  renderNavigation = () => {
    const { _endSession: endSession } = this;
    return html`
      <nav class="panel">
        <ul>
          <li><a class="button" href="/">${home('1.5em', '1.5em')} <span>Home</span></a></li>
          <li><a class="button" href="/teams">${banner('1.5em', '1.5em')} <span>Teams</span></a></li>
          <li><a class="button" href="/players">${helmet('1.5em', '1.5em')} <span>Players</span></a></li>
          <li><a class="button" href="/free-agency">${transaction('1.5em', '1.5em')} <span>Free Agency</span></a></li>
          <li><a class="button" href="/rulebook">${rules('1.5em', '1.5em')} <span>Rulebook</span></a></li>
          <li><button @click="${endSession}">${logout('1.5em', '1.5em')} <span>Log Out</span></button></li>
        </ul>
      </nav>
    `
  }

  renderDashboard = () => html`
    ${this.renderNavigation()}
    <div id="page-content">
      <header class="panel">
        <button @click="${this._toggleNavTray}" aria-label="Toggle Navigation">${menu('1.5em', '1.5em')}</button>
        <h1>${this.pageTitle}</h1>
      </header>
      <main>
        <slot></slot>
      </main>
      <footer>
        &copy; 2012-${(new Date()).getFullYear()}
        The League of Ordinary Gentlemen. <br/>
        All rights reserved.
      </footer>
    </div>
  `;

  render = () => {
    const {_isLoggedIn: isLoggedIn} = this;

    if (isLoggedIn === false) return this.renderLogIn();
    if (isLoggedIn === true) return this.renderDashboard();
    return '';
  }

  static styles = css`
    ${unsafeCSS(basestyles)}
    ${unsafeCSS(componentStyles)}
  `;
}

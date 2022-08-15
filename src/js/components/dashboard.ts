import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property } from 'lit/decorators.js';
import QueryMixin from "../utilities/QueryMixin";
import Queries from "../utilities/Queries";
import { EVENTS, AuthenticatedUser } from "../types/defs";
import { home, banner, helmet, transaction, rules } from "../utilities/icons";

const loginFormMarkup = `
  <form slot="login">
    <input type="email" name="email" placeholder="Email Address"/>
    <input type="password" name="password" placeholder="Password"/>
    <input type="submit" hidden />
  </form>
`;

interface FormSubmitValues extends HTMLFormControlsCollection {
  email?: HTMLInputElement;
  password?: HTMLInputElement;
}

@customElement('log-dashboard')
export class LogDashboard extends QueryMixin(LitElement) {

  @property({attribute: false, type: Boolean, reflect: true})
  private _navOpen = false;

  @property({attribute: false})
  private _isLoggedIn?: Boolean | undefined;

  @property({attribute: false})
  user?: AuthenticatedUser;

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
    this._navOpen = !this._navOpen;
    this.classList.toggle('nav-closed')
  }

  connectedCallback() {
    const { _authFormSubmit: onLogin } = this;

    super.connectedCallback();

    // Check authentication status on page load
    this._checkLoginStatus();

    // Allow event to trigger UI update
    this.addEventListener(
      EVENTS.doUpdateLoginStatus,
      this._checkLoginStatus.bind(this)
    );

    // Inject form into main document.
    // Form cannot be in shadowdom because `submit` event is not composed.
    this.insertAdjacentHTML('afterbegin', loginFormMarkup);

    // Prevent form submissions from triggering page reload.
    this.addEventListener('submit', (e) => {e.preventDefault()})
    //this.addEventListener('submit', onLogin, true);
  }

  protected updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (changedProperties.has('user')) {
      console.log('user changed!');

      const { dispatchEvent, eventUpdateLoginStatus } = this;
      // Allow other components to respond to auth status changes.
      setTimeout(() => {
        dispatchEvent(eventUpdateLoginStatus);
        console.log(eventUpdateLoginStatus);
      }, 0);
    }
  }

  renderLogIn = () => {
    return html`
      <form @submit=${this._authFormSubmit}>
        <input type="email" name="email" placeholder="Email Address"/>
        <input type="password" name="password" placeholder="Password"/>
        <input type="submit" hidden />
      </form>
    `
  };

  renderNavigation = () => {
    const { _endSession: endSession } = this;
    return html`
      <nav>
        <ul>
          <li><a href="/">${home('2em', '2em')} Home</a></li>
          <li><a href="/teams">${banner('2em', '2em')} Teams</a></li>
          <li><a href="/players">${helmet('2em', '2em')} Players</a></li>
          <li><a href="/free-agency">${transaction('2em', '2em')} Free Agency</a></li>
          <li><a href="/rulebook">${rules('2em', '2em')} Rulebook</a></li>
          <li><button @click="${endSession}">Log Out</button></li>
        </ul>
      </nav>
    `
  }

  renderDashboard = () => html`
    ${this.renderNavigation()}
    <div id="page-content">
      <header>
        <button @click="${this._toggleNavTray}">Toggle Nav</button>
      </header>
      <main>
        <slot></slot>
      </main>
      <footer>
        &copy; ${(new Date()).getFullYear()}
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
    :host {
      --nav-width: 16rem;
      display: flex;
      width: 100%;
      height: 100%;
      position: fixed;
      inset: 0 0 0 auto;
      transition: width 0.33s ease-in-out;
    }

    :host(.nav-closed) {
      width: calc(100% + var(--nav-width));
    }

    nav {
      width: var(--nav-width);
      background: #eee;
      flex: 0 0 var(--nav-width)
    }

    #page-content {
      flex: 1 1 100%;
      height: 100%;
      background: #999;
      overflow-y: scroll;
    }

    @media screen and (max-width: 750px) {
      :host, :host(.nav-closed) {
        width: 100%;
      }

      nav {
        position: fixed;
        inset: 0 auto 0 0;
      }
    }
  `
}

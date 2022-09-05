import { LitElement, html, css, PropertyValueMap, unsafeCSS, CSSResultGroup} from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from "lit/directives/if-defined";
import { unsafeHTML } from "lit/directives/unsafe-html";
import basestyles from "bundle-text:../../styles/all.scss";
import componentstyles from "bundle-text:../../styles/components/inputSwitch.scss"

@customElement('input-switch')
export class InputSwitch extends LitElement {

  @property({attribute: 'multiple', reflect: true})
  multiple = false;

  @property({attribute: 'name', reflect: true})
  name?: string;

  @property({attribute: 'value', reflect: true})
  value?: string;

  private contentsObserver = new MutationObserver(this.subTreeUpate.bind(this));

  private subTreeUpate(entries: MutationRecord[]) {
    this.options = Array
      .from(this.children)
      .filter(child => child instanceof HTMLButtonElement) as [HTMLButtonElement];
  }

  private options: HTMLButtonElement[] = [];

  connectedCallback() {
    super.connectedCallback();

    const {contentsObserver} = this;

    contentsObserver.observe(this, {
      subtree: true,
      attributes: true,
    });

    this.subTreeUpate([]);
  }

  render() {
    return html`
      <fieldset>
        ${this.options.map((opt, i) => this.renderOption(opt, i))}
      </fieldset>
    `
  }

  renderOption(option: HTMLButtonElement, i: number) {
    const { multiple, name } = this;
    const { value, innerHTML, selected } = option;

    const type = multiple ? 'checkbox' : 'radio';

    return html`
      <input
        class="visually-hidden"
        type="${type}"
        name="${ifDefined(name)}"
        id="option-${i}"
        value=${value}
        ?checked=${option.hasAttribute('selected')}
      />
      <label for="option-${i}">
        ${unsafeHTML(innerHTML)}
      </label>
    `
  }

  static styles = css`
    ${unsafeCSS(basestyles)}
    ${unsafeCSS(componentstyles)}
  `
}

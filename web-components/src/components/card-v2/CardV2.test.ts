import { elementUpdated, fixture, fixtureCleanup, html } from "@open-wc/testing-helpers";
import "./CardV2";
import { CardState, type CardV2 } from "./CardV2";

const fixtureFactory = async (
  state: CardState,
  identifier: string,
  header: string,
  info: string,
  data: string,
  expandable: boolean
): Promise<CardV2.ELEMENT> => {
  return await fixture(html`
    <md-card-v2
      state=${state}
      identifier=${identifier}
      header=${header}
      info=${info}
      data=${data}
      .expandable=${expandable}
    >
    </md-card-v2>
  `);
};

describe("Card-v2 component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    fixtureCleanup();
  });

  it("should render correctly", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );
    expect(element).not.toBeNull();
  });

  it("should render title when title is not empty", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );
    const header = element.shadowRoot?.querySelector(".md-card-v2-header-title h3");
    expect(header).not.toBeNull();
    expect(header?.textContent).toBe("Test Title");
  });

  it("should render info when info is not empty", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );
    const info = element.shadowRoot?.querySelector(".md-card-v2-header-title md-icon") as HTMLButtonElement;
    expect(info).not.toBeNull();
    expect(info?.name).toBe("info-badge-filled");
  });

  it("should render data when data is not empty", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );
    const data = element.shadowRoot?.querySelector(".md-card-v2-content h2");
    expect(data).not.toBeNull();
    expect(data?.textContent).toBe("Test Data");
  });

  it("should render footer when expandable is true", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );
    const footer = element.shadowRoot?.querySelector(".md-card-v2-footer");
    expect(footer).not.toBeNull();
    expect(footer?.classList.contains("hidden")).toBe(false);
  });

  it("should hide footer when expandable is false", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      false
    );
    const footer = element.shadowRoot?.querySelector(".md-card-v2-footer-expand");
    expect(footer).not.toBeNull();
    expect(footer?.classList.contains("hidden")).toBe(true);
  });

  it("Toggling expand card from expand button should dispatch its event", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );

    const expandCardButton = element.shadowRoot?.querySelector(".md-card-v2-footer md-button") as HTMLButtonElement;
    expect(expandCardButton).not.toBeNull();

    const eventSpy = jest.fn();
    element.addEventListener("expand-card-toggled", eventSpy);

    const info = element.shadowRoot?.querySelector(".md-card-v2-footer md-icon") as HTMLButtonElement;
    expect(info).not.toBeNull();
    expect(info?.name).toBe("arrow-circle-up-bold");

    expandCardButton?.click();
    await elementUpdated(element);

    expect(eventSpy).toHaveBeenCalled();
    expect(info?.name).toBe("arrow-circle-down-bold");
  });

  it("Toggling expand card from card background should dispatch its event", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      true
    );

    const cardBackground = element.shadowRoot?.querySelector(".md-card-v2") as HTMLElement;
    expect(cardBackground).not.toBeNull();

    const eventSpy = jest.fn();
    element.addEventListener("expand-card-toggled", eventSpy);

    const info = element.shadowRoot?.querySelector(".md-card-v2-footer md-icon") as HTMLButtonElement;
    expect(info).not.toBeNull();
    expect(info?.name).toBe("arrow-circle-up-bold");

    cardBackground?.click();
    await elementUpdated(element);

    expect(eventSpy).toHaveBeenCalled();
    expect(info?.name).toBe("arrow-circle-down-bold");
  });

  it("Card background should not be clickable when card is not expandable", async () => {
    const element: CardV2.ELEMENT = await fixtureFactory(
      CardState.ACTIVE,
      "123",
      "Test Title",
      "Test Info",
      "Test Data",
      false
    );

    const cardBackground = element.shadowRoot?.querySelector(".md-card-v2") as HTMLElement;
    expect(cardBackground).not.toBeNull();

    const eventSpy = jest.fn();
    element.addEventListener("expand-card-toggled", eventSpy);

    const info = element.shadowRoot?.querySelector(".md-card-v2-footer md-icon") as HTMLButtonElement;
    expect(info).not.toBeNull();
    expect(info?.name).toBe("arrow-circle-up-bold");

    cardBackground?.click();
    await elementUpdated(element);

    expect(eventSpy).not.toHaveBeenCalled();
    expect(info?.name).toBe("arrow-circle-up-bold");
  });

  it("should increment rendered data at 1 sec intervals when active", async () => {
    
    const fixedDate = new Date("2023-10-01T00:00:00Z");
    jest.setSystemTime(fixedDate);
      
    const element: CardV2.ELEMENT = await fixture(html`
      <md-card-v2
        state=${CardState.ACTIVE}
        identifier=${"123"}
        header=${"Test Title"}
        info=${"Test Info"}
        createdTime=${Date.now()}
        .active=${true}
        .expandable=${true}
      >
      </md-card-v2>
    `)

    expect(element.createdTime).toBe(1696118400000);
    expect(element.active).toBe(true);
    
    const data = element.shadowRoot?.querySelector(".md-card-v2-content h2");
    expect(data).not.toBeNull();
    expect(data?.textContent).toBe("00:00:00");

    // Simulate the passage of time
    jest.advanceTimersByTime(61000); // 61 seconds
    await elementUpdated(element);
    expect(data?.textContent).toBe("00:01:01");    
  });

  it("should show extra-info", async () => {
    const element = await fixture(html`
      <md-card-v2
        state=${CardState.ACTIVE}
        identifier=${"123"}
        header=${"Test Title"}
        info=${"Test info"}
        data=${"00:00:00"}
        .expandable=${false}
      >
        <div slot="card-extra-info">
          <md-icon slot="icon" name="arrow-tail-up-bold" color="green-50" size="18" iconSet="momentumDesign"></md-icon>
          <span>This is a test</span>
        </div>
        <div slot="card-footer-content">
          <md-icon
            slot="icon"
            name="people-filled"
            color="var(--md-primary-text-color)"
            size="14"
            iconSet="momentumDesign"
          ></md-icon>
          <span>54.0</span>
        </div>
      </md-card-v2>
 `);
    const extraInfo = element.shadowRoot?.querySelector(".md-card-v2-content-extra-info");
    expect(extraInfo).not.toBeNull();
    const extraInfoSlot = element.shadowRoot?.querySelector('slot[name="card-extra-info"]');
    expect(extraInfoSlot).not.toBeNull();
    const footerSlot = element.shadowRoot?.querySelector('slot[name="card-footer-content"]');
    expect(footerSlot).not.toBeNull();

  });
});

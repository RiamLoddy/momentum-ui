import { Key } from "@/constants";
import { now } from "@/utils/dateUtils";
import { elementUpdated, fixture, fixtureCleanup, html } from "@open-wc/testing-helpers";
import { TemplateResult } from "lit-element";
import { DateTime } from "luxon";
import "../button/Button";
import "./DatePicker";
import { type DatePicker } from "./DatePicker";

const keyNavEvent = (key: KeyboardEvent["code"], date: DateTime): CustomEvent => {
  return new CustomEvent("day-key-event", {
    detail: {
      date: date,
      sourceEvent: new KeyboardEvent("keydown", { code: key })
    }
  });
};

const createKeyboardEvent = (code: string) =>
  new KeyboardEvent("keydown", {
    code
  });

async function createFixture(template: string | TemplateResult): Promise<DatePicker.ELEMENT> {
  const element = await fixture<DatePicker.ELEMENT>(template);
  return element;
}

describe("DatePicker Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    fixtureCleanup();
  });
  test("should render", async () => {
    const el: DatePicker.ELEMENT = await createFixture(html` <md-datepicker></md-datepicker> `);
    expect(el).not.toBeNull();
  });

  test("should open on pressing arrowDown on input", async () => {
    const startDate = now();
    const el: DatePicker.ELEMENT = await createFixture(html`
      <md-datepicker .focusedDate=${startDate}></md-datepicker>
    `);
    const input = el.shadowRoot!.querySelector("md-input");
    input?.dispatchEvent(createKeyboardEvent(Key.ArrowDown));
    expect(el.menuOverlay.isOpen).toBeTruthy();
  });

  test("should handle date selection update", async () => {
    const firstDate = DateTime.fromObject({ month: 11, day: 15 });
    const secondDate = firstDate.plus({ days: 2 });
    const el: DatePicker.ELEMENT = await createFixture(html`
      <md-datepicker .selectedDate=${firstDate}></md-datepicker>
    `);
    const event = new CustomEvent("day-select", {
      detail: {
        date: secondDate
      }
    });
    const selectFunc = jest.spyOn(el, "handleSelect");
    el.handleSelect(event);
    expect(selectFunc).toHaveBeenCalled();
    expect(el.selectedDate).toEqual(secondDate);
  });

  test("should navigate focus with keydown events", async () => {
    const startDate = now();
    const el: DatePicker.ELEMENT = await createFixture(html`
      <md-datepicker .focusedDate=${startDate}></md-datepicker>
    `);
    const navLeft = keyNavEvent("ArrowLeft", startDate);
    el.handleKeyDown(navLeft);
    await elementUpdated(el);
    expect(el.focusedDate.ordinal).toEqual(startDate.ordinal - 1);
    const navRight = keyNavEvent("ArrowRight", startDate);
    el.handleKeyDown(navRight);
    await elementUpdated(el);
    expect(el.focusedDate.ordinal).toEqual(startDate.ordinal);
    const navUp = keyNavEvent("ArrowUp", startDate);
    el.handleKeyDown(navUp);
    await elementUpdated(el);
    expect(el.focusedDate.ordinal).toEqual(startDate.ordinal - 7);
    const navDown = keyNavEvent("ArrowDown", startDate);
    el.handleKeyDown(navDown);
    await elementUpdated(el);
    expect(el.focusedDate.ordinal).toEqual(startDate.ordinal);
  });
  test("should select date with keydown events", async () => {
    const startDate = now();
    const el: DatePicker.ELEMENT = await createFixture(html`
      <md-datepicker .focusedDate=${startDate}></md-datepicker>
    `);
    const selectionFunc = jest.spyOn(el, "handleSelect");
    const enterSelect = keyNavEvent("Enter", startDate);
    el.handleKeyDown(enterSelect);
    await el.updateComplete;
    expect(selectionFunc).toHaveBeenCalled();
    const spaceSelect = keyNavEvent("Space", startDate);
    el.handleKeyDown(spaceSelect);
    await el.updateComplete;
    expect(selectionFunc).toHaveBeenCalled();
  });

  test("should render with custom date trigger", async () => {
    const el: DatePicker.ELEMENT = await createFixture(html`
      <md-datepicker custom-trigger>
        <md-button slot="date-trigger" variant="primary">Date Trigger</md-button>
      </md-datepicker>
    `);
    expect(el).not.toBeNull();
  });

  test("should update value and fire the date-input-change event when handleDateInputChange is called with an empty string", async () => {
    const el: DatePicker.ELEMENT = await fixture(html` <md-datepicker></md-datepicker> `);
    const eventSpy = jest.spyOn(el, "dispatchEvent");
    const event = new CustomEvent("input-change", { detail: { value: "" } });
    el.handleDateInputChange(event);
    expect(el.value).toBe("");
    expect(eventSpy).toHaveBeenCalledWith(
      new CustomEvent("date-input-change", {
        bubbles: true,
        composed: true,
        detail: {
          sourceEvent: event,
          value: ""
        }
      })
    );
  });
});

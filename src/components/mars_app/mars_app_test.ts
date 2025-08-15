import { describe, it } from "@std/testing/bdd";
import { createElement } from "react";
import MarsApp from "./mars_app.tsx";
import { expect } from "@std/expect";

describe("headless mode", () => {
  it("sets headless mode to false by default", () => {
    const component = createElement(MarsApp);

    expect(component.props.headlessMode).toBe(undefined);
  });

  it("can set headless mode to be true", () => {
    const component = createElement(MarsApp, { headlessMode: true });

    expect(component.props.headlessMode).toBe(true);
  });
});

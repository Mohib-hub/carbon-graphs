describe("Line Graph", () => {
    beforeEach(() => {
        // eslint-disable-next-line no-undef
        browser.url("#/line/simple");
    });
    describe("browser", () => {
        it("should have correct link", () => {
            // eslint-disable-next-line no-undef
            expect(browser).toHaveUrl("http://localhost:9991/#/line/simple");
        });
        it("should have right title", () => {
            // eslint-disable-next-line no-undef
            expect(browser).toHaveTitle("Carbon");
        });
    });
    describe("Container", () => {
        it("checks graph container element existence in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-graph-container")).toExist();
        });
        it("checks axis element in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-graph-canvas")).toExist();
        });
        it("checks axis element in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-grid")).toExist();
        });
        it("checks axis element in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-content-container")).toExist();
        });
        it("checks axis element in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-graph-canvas")).toExist();
        });
        it("checks axis element in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-y-axis-label")).toExist();
            // eslint-disable-next-line no-undef
            const x = $(".carbon-y-axis-label").getAttribute("transform");
            expect(parseInt(x.slice(10, 12))).toBe(30);
        });
    });

    describe("Axis", () => {
        it("checks axis x element existence in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-axis.carbon-axis-x")).toExist();
        });
        it("checks axis y element existence in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-axis.carbon-axis-y")).toExist();
        });
        it("should have correct tick values in x-axis", () => {
            // eslint-disable-next-line no-undef
            const elem = $$(".carbon-axis.carbon-axis-x .tick");
            expect(elem[0].getText()).toBe("100");
            expect(elem[1].getText()).toBe("150");
            expect(elem[2].getText()).toBe("200");
            expect(elem[3].getText()).toBe("250");
        });
        it("should have correct tick values in y-axis", () => {
            // eslint-disable-next-line no-undef
            const elem = $$(".carbon-axis.carbon-axis-y .tick");
            expect(elem[0].getText()).toBe("-20");
            expect(elem[1].getText()).toBe("-15");
            expect(elem[2].getText()).toBe("-10");
            expect(elem[3].getText()).toBe("-5");
            expect(elem[4].getText()).toBe("0");
            expect(elem[5].getText()).toBe("5");
            expect(elem[6].getText()).toBe("10");
            expect(elem[7].getText()).toBe("15");
            expect(elem[8].getText()).toBe("20");
        });
    });

    describe("Legend", () => {
        beforeEach(() => {
            // eslint-disable-next-line no-undef
            $(".carbon-legend-item").click();
        });
        afterEach(() => {
            // eslint-disable-next-line no-undef
            $(".carbon-legend-item").click();
        });
        it("checks legend element existence in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-legend")).toExist();
        });
        it("checks legend element existence in graph", () => {
            // eslint-disable-next-line no-undef
            expect($(".carbon-legend .carbon-legend-item-text").getText()).toBe(
                "Data Label 1"
            );
        });
        it("should disable content line when legend item is clicked", () => {
            expect(
                $(".carbon-data-lines-group .carbon-line")
                    .$("<path />")
                    .getAttribute("aria-hidden")
            ).toBe("true");
        });
        it("should enable content line when legend item is clicked twice", () => {
            $(".carbon-legend-item").click();
            console.log("for legend" + $(".carbon-legend-item").isClickable());
            expect(
                $(".carbon-data-lines-group .carbon-line")
                    .$("<path />")
                    .getAttribute("aria-hidden")
            ).toBe("false");
            $(".carbon-legend-item").click();
        });
    });

    describe("Label", () => {
        it("should have correct label in x-axis", () => {
            expect($(".carbon-x-axis-label").getText()).toBe("Data");
        });
        it("should have correct label in y-axis", () => {
            expect($(".carbon-y-axis-label").getText()).toBe("Line Set A");
        });
    });
});

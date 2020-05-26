"use strict";
import { GraphContent } from "../../core";
import { getDefaultValue } from "../../core/BaseConfig";
import constants from "../../helpers/constants";
import {
    prepareLabelShapeItem,
    removeLabelShapeItem
} from "../../helpers/label";
import { removeLegendItem } from "../../helpers/legend";
import styles from "../../helpers/styles";
import utils from "../../helpers/utils";
import BarConfig from "./BarConfig";
import { removeAxisInfoRowLabels } from "./helpers/axisInfoRowHelpers";
import {
    clear,
    draw,
    prepareLegendItems,
    processDataPoints,
    setGroupName,
    drawDataBars
} from "./helpers/creationHelpers";
import { processGoalLines, translateRegion } from "./helpers/goalLineHelpers";
import { clickHandler, hoverHandler } from "./helpers/legendHelpers";
import { scaleBandAxis, setBarOffsets } from "./helpers/resizeHelpers";
import {
    clearSelectionDatum,
    updateSelectionBars
} from "./helpers/selectionHelpers";
import {
    translateBarGraph,
    translateTextLabel
} from "./helpers/translateHelpers";

/**
 * Calculates the min and max values for Y Axis or Y2 Axis
 *
 * @private
 * @param {Array} values - Datapoint values
 * @param {string} axis - y or y2
 * @returns {object} - Contains min and max values for the data points
 */
const calculateValuesRange = (values, axis = constants.Y_AXIS) => {
    const min = Math.min(...values.map((i) => i.y));
    const max = Math.max(...values.map((i) => i.y));
    return {
        [axis]: {
            min: min < 0 ? min : 0,
            max: max > 0 ? max : 0
        }
    };
};

/**
 * Data point sets can be loaded using this function.
 * Load function validates, clones and stores the input onto a config object.
 *
 * @private
 * @param {object} inputJSON - Input JSON provided by the consumer
 * @returns {object} BarConfig config object containing consumer data
 */
const loadInput = (inputJSON) =>
    new BarConfig().setInput(inputJSON).validateInput().clone().getConfig();
/**
 * Initializes the necessary Bar constructor objects
 *
 * @private
 * @param {Bar} control - Bar instance
 * @returns {Bar} Bar instance
 */
const initConfig = (control) => {
    control.config = {};
    control.bandScale = {
        x0: {},
        x1: {}
    };
    control.dataTarget = {};
    control.valuesRange = {};
    return control;
};

/**
 * A bar graph is a graph used to represent numerical values of data by
 * height or length of lines or rectangles of equal width
 *
 * Lifecycle functions include:
 *  * Load
 *  * Generate
 *  * Unload
 *  * Destroy
 *
 * @module Bar
 * @class Bar
 */
class Bar extends GraphContent {
    /**
     * @class
     * @param {BarConfig} input - Input JSON instance created using GraphConfig
     */
    constructor(input) {
        super();
        initConfig(this);
        this.config = loadInput(input);
        this.type = "Bar";
        this.config.yAxis = getDefaultValue(
            this.config.yAxis,
            constants.Y_AXIS
        );
        this.config.axisPadding = false;
        this.valuesRange = calculateValuesRange(
            this.config.values,
            this.config.yAxis
        );
    }

    /**
     * @inheritdoc
     */
    load(graph) {
        setGroupName(this.config, graph.content);
        scaleBandAxis(this.bandScale, graph.config, graph.content);
        this.dataTarget = processDataPoints(graph.config, this.config);
        draw(
            graph.scale,
            this.bandScale,
            graph.config,
            graph.svg,
            this.dataTarget
        );
        updateSelectionBars(
            this.dataTarget.internalValuesSubset,
            graph.svg,
            graph.config
        );
        prepareLegendItems(
            graph.config,
            {
                clickHandler: clickHandler(
                    graph,
                    this,
                    graph.config,
                    graph.svg
                ),
                hoverHandler: hoverHandler(graph.config.shownTargets, graph.svg)
            },
            this.dataTarget,
            graph.legendSVG
        );
        prepareLabelShapeItem(
            graph.config,
            this.dataTarget,
            graph.axesLabelShapeGroup[this.config.yAxis]
        );
        return this;
    }

    /**
     * @inheritdoc
     */
    unload(graph) {
        clear(graph.svg, this.dataTarget.key);
        removeLegendItem(graph.legendSVG, this.dataTarget);
        removeLabelShapeItem(
            graph.axesLabelShapeGroup[this.config.yAxis],
            this.dataTarget,
            graph.config
        );
        removeAxisInfoRowLabels(
            graph.svg.select(`.${styles.axisInfoRow}`),
            this.dataTarget.key
        );
        clearSelectionDatum(graph.svg, this.dataTarget.key);
        initConfig(this);
        return this;
    }

    /**
     * @inheritdoc
     */
    resize(graph) {
        scaleBandAxis(this.bandScale, graph.config, graph.content);
        setBarOffsets(
            graph.content,
            graph.contentConfig,
            this,
            this.bandScale,
            graph.config
        );
        translateBarGraph(
            graph.scale,
            this.bandScale,
            graph.svg,
            this.dataTarget,
            graph.config
        );
        if (utils.notEmpty(this.dataTarget.axisInfoRow)) {
            translateTextLabel(
                this.bandScale,
                graph.scale,
                graph.config,
                graph.svg,
                this.dataTarget.axisInfoRow,
                this.dataTarget
            );
        }
        if (utils.notEmpty(this.dataTarget.regions)) {
            processGoalLines(
                graph.scale,
                this.bandScale,
                graph.config,
                this.dataTarget,
                this.config.yAxis
            );
            translateRegion(
                graph.scale,
                graph.config,
                graph.svg.selectAll(
                    `rect[aria-describedby=region_${this.dataTarget.key}]`
                )
            );
        }
        return this;
    }

    /**
     * @inheritdoc
     */
    reflow(graph, graphData) {
        this.config.values = graphData.values; // Update the old Bar config values with the new provided values
        this.dataTarget = processDataPoints(graph.config, this.config); // Update the dataTarget
        const position = graph.config.shownTargets.lastIndexOf(graphData.key);
        if (position > -1) {
            graph.config.shownTargets.splice(position, 1); // This is done to remove duplicate keys due to processDataPoints
        }
        const tickValues = graph.config.axis.x.ticks.values.map((d) => ( // consolidating data into an object
            {
            x: d,
            valueSubsetArray: []
        }));

        scaleBandAxis(this.bandScale, graph.config, graph.content);
        const barSelectionGroup = graph.svg.select(`.${styles.barSelectionGroup}`) // Updating Bars Selection Group starts here.
                                    .selectAll(`.${styles.taskBarSelection}`)
                                    .data(tickValues); // comparing new data to old data and creating enter and exit states.
        barSelectionGroup
            .enter()
            .append("rect")
            .attr("aria-hidden", true)
            .classed(styles.taskBarSelection, true)
            .attr(
                "aria-describedby",
                (value) => `bar-selector-${tickValues.indexOf(value)}`
            )
            .attr("rx", 3)
            .attr("ry", 3);
        barSelectionGroup
            .exit()
            .transition()
            .call(constants.d3Transition(graph.config.settingsDictionary.transition))
            .remove();
        
        updateSelectionBars( this.dataTarget.internalValuesSubset, // Updating Bars Selection Group ends here.
            graph.svg,
            graph.config
        );

        const currentBarsPath = graph.svg // Updating Bars starts here.
                                .select(`g[aria-describedby="${graphData.key}"]`)
                                .select(`[class="${styles.currentBarsGroup}"]`)
                                .data([this.dataTarget]); // comparing new data to old data and creating enter and exit states.
        const bars = currentBarsPath
                    .selectAll(`.${styles.bar} > rect`)
                    .data(this.dataTarget.internalValuesSubset); // comparing new data to old data and creating enter and exit states.
        drawDataBars( // Passing the enter state to be drawn
            graph.scale,
            this.bandScale,
            graph.config,
            graph.svg,
            bars.enter(),
            this.dataTarget.regions,
            this.dataTarget.axisInfoRow
        );
        bars
            .exit()
            .transition()
            .call(
                constants.d3Transition(
                    graph.config.settingsDictionary.transition
                )
            )
            .remove();  // Updating Bars ends here.
        this.valuesRange = calculateValuesRange( // updating valuesRanges for Y axis
            this.config.values,
            this.config.yAxis
        );
        this.resize(graph);
    }

    /**
     * @inheritdoc
     */
    redraw(graph) {
        clear(graph.svg, this.dataTarget.key);
        removeAxisInfoRowLabels(
            graph.svg.select(`.${styles.axisInfoRow}`),
            this.dataTarget.key
        );
        draw(
            graph.scale,
            this.bandScale,
            graph.config,
            graph.svg,
            this.dataTarget
        );
        return this;
    }
}

export default Bar;

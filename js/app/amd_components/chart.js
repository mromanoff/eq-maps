/*jshint maxparams: 4 */
define(function (require, exports, module) {
    'use strict';

    // Extended charts to chartjs

    var Chart = require('/assets/js/vendor/bower_components/chartjs/chart.js'),
        helpers = Chart.helpers,
        defaultConfig = {
            scaleBeginAtZero : true,
            //Boolean - Whether grid lines are shown across the chart
            scaleShowGridLines : true,
            //String - Colour of the grid lines
            scaleGridLineColor : 'rgba(0,0,0,.05)',
            //Number - Width of the grid lines
            scaleGridLineWidth : 1,
            //Boolean - If there is a stroke on each bar
            barShowStroke : true,
            //Number - Pixel width of the bar stroke
            barStrokeWidth : 2,
            //Number - Spacing between each of the X value sets
            barValueSpacing : 5,
            //Boolean - Whether bars should be rendered on a percentage base
            relativeBars : false,
            //String - A legend template
            legendTemplate : '<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
        };

    // Extending Scale to just render horizontal lines
    Chart.xScale = Chart.Scale.extend({
        buildYLabels : function () {
            this.yLabels = [];

            var helpers = window.Chart.helpers,
                stepDecimalPlaces = helpers.getDecimalPlaces(this.stepValue),
                yAxisLabels;

            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(helpers.template(this.templateString, { value: (this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces) }));
            }

            if (this.showAxisLabels) {
                yAxisLabels = _.union(this.yLabels, [this.xLabel, this.yLabel]);
            } else {
                yAxisLabels = this.yLabels;
            }

            this.yLabelWidth = (this.display && this.showLabels) ? helpers.longestText(this.ctx, this.font, yAxisLabels) : 0;

            this.yLabelWidth += 5;
        },
        // Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
        fit: function () {
            // First we need the width of the yLabels, assuming the xLabels aren't rotated

            // To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
            this.startPoint = (this.display) ? this.fontSize : 0;
            this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

            // Apply padding settings to the start and end point.
            this.startPoint += this.padding;
            this.startPoint += 25;
            this.endPoint -= this.padding;
            this.endPoint -= 35;

            // Cache the starting height, so can determine if we need to recalculate the scale yAxis
            var cachedHeight = this.endPoint - this.startPoint,
                cachedYLabelWidth;

            // Build the current yLabels so we have an idea of what size they'll be to start
            /*
             *  This sets what is returned from calculateScaleRange as static properties of this class:
             *
                this.steps;
                this.stepValue;
                this.min;
                this.max;
             *
             */
            this.calculateYRange(cachedHeight);

            // With these properties set we can now build the array of yLabels
            // and also the width of the largest yLabel
            this.buildYLabels();

            this.calculateXLabelRotation();

            while ((cachedHeight > this.endPoint - this.startPoint)) {
                cachedHeight = this.endPoint - this.startPoint;
                cachedYLabelWidth = this.yLabelWidth;

                this.calculateYRange(cachedHeight);
                this.buildYLabels();

                // Only go through the xLabel loop again if the yLabel width has changed
                if (cachedYLabelWidth < this.yLabelWidth) {
                    this.calculateXLabelRotation();
                }
            }

        },
        setLabelVisibility: function (labelsCount) {
            var labelsVisibility = _.range(labelsCount).map(function () {
                return false;
            });

            for (var i = 0; i < labelsVisibility.length ; i++) {
                if (i === 0 || ((i + 1) % this.labelStep) === 0) {
                    labelsVisibility[i] = true;
                }
            }

            return labelsVisibility;
        },
        draw: function () {
            var ctx = this.ctx,
                yLabelGap = (this.endPoint - this.startPoint) / this.steps,
                xStart = Math.round(this.xScalePaddingLeft),
                helpers = window.Chart.helpers;

            if (yLabelGap < this.fontSize) {
                yLabelGap = this.fontSize;
            }

            if (this.display) {
                ctx.fillStyle = this.textColor;
                ctx.font = this.font;

                if (this.showAxisLabels) {
                    ctx.restore();
                    ctx.textAlign = 'center';
                    ctx.save();
                    ctx.font = helpers.fontString(this.fontSize, '400', this.fontFamily);
                    ctx.fillText(this.yLabel, xStart - 24, this.startPoint - 28);
                    ctx.fillText(this.xLabel, xStart - 24, this.endPoint + 36);
                    ctx.restore();
                }

                helpers.each(this.yLabels, function (labelString, index) {
                    var yLabelCenter = this.endPoint - (yLabelGap * index),
                        linePositionY = Math.round(yLabelCenter);

                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'middle';
                    if (this.showLabels) {
                        ctx.fillText(labelString, xStart - 15, yLabelCenter);
                    }
                    ctx.setLineDash([1, 6]);
                    ctx.beginPath();
                    if (index > 0) {
                        // This is a grid line in the centre, so drop that
                        ctx.lineWidth = this.gridLineWidth;
                        ctx.strokeStyle = this.gridLineColor;
                    } else {
                        // This is the first line on the scale
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.lineColor;
                    }

                    linePositionY += helpers.aliasPixel(ctx.lineWidth);

                    ctx.moveTo(xStart, linePositionY);
                    ctx.lineTo(this.width, linePositionY);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                    ctx.beginPath();
                    ctx.moveTo(xStart - 5, linePositionY);
                    ctx.lineTo(xStart, linePositionY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.closePath();

                }, this);


                if (this.labelStepping === 'undefined') {
                    this.labelStepping = false;
                }

                // Check label stepping
                if (this.labelStepping) {
                    var labelVisibilityList = this.setLabelVisibility(this.xLabels.length);
                }

                helpers.each(this.xLabels, function (label, index) {
                    var xPos = this.calculateX(index) + helpers.aliasPixel(this.lineWidth),
                        // Check to see if line/bar here and decide where to place the line
                        linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + helpers.aliasPixel(this.lineWidth);

                    ctx.beginPath();
                    ctx.setLineDash([1, 6]);

                    if (index > 0) {
                        // This is a grid line in the centre, so drop that
                        ctx.lineWidth = this.gridLineWidth;
                        ctx.strokeStyle = this.gridLineColor;
                    } else {
                        // This is the first line on the scale
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.lineColor;
                    }
                    ctx.moveTo(linePos, this.endPoint);
                    ctx.stroke();
                    ctx.closePath();


                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;


                    // Small lines at the bottom of the base grid line
                    ctx.beginPath();
                    ctx.moveTo(linePos, this.endPoint);
                    ctx.stroke();
                    ctx.closePath();

                    ctx.save();

                    if (this.showAxisLabels && index === 0) {
                        xPos += 2;
                    }

                    ctx.translate(xPos, this.endPoint + 30);
                    ctx.font = this.font;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    if (label === this.activeLabel) {
                        ctx.fillStyle = '#fff';
                    } else {
                        ctx.fillStyle = this.textColor;
                    }

                    // Show only visible labels
                    if (this.labelStepping && labelVisibilityList[index] || !this.labelStepping) {
                        if (this.labelTrimSeconds) {
                            label = label.slice(0, label.indexOf(':'));
                        }
                        ctx.fillText(label, 0, 0);
                    } else {
                        ctx.fillText('', 0, 0);
                    }

                    ctx.restore();
                    ctx.setLineDash([]);

                }, this);
            }
        }
    });


    Chart.SlicedRectangle = Chart.Element.extend({
        draw : function () {
            var ctx = this.ctx,
                halfWidth = this.width / 2,
                leftX = this.x - halfWidth,
                rightX = this.x + halfWidth,
                topL = this.base - (this.base - this.y) + this.sliceSize,
                topR = this.base - (this.base - this.y),
                halfStroke = this.strokeWidth / 2;

            if (topL > this.base) {
                topL = this.base - (this.base - this.y);
            }

            // Canvas doesn't allow us to stroke inside the width so we can
            // adjust the sizes to fit if we're setting a stroke on the line
            if (this.showStroke) {
                leftX += halfStroke;
                rightX -= halfStroke;
                topL += halfStroke;
                topR += halfStroke;
            }

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([]);

            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;

            // It'd be nice to keep this class totally generic to any rectangle
            // and simply specify which border to miss out.
            ctx.moveTo(leftX, this.base);
            ctx.lineTo(leftX, topL);
            ctx.lineTo(rightX, topR);
            ctx.lineTo(rightX, this.base);
            ctx.fill();
            if (this.showStroke) {
                ctx.stroke();
            }
            ctx.restore();
        },
        height : function () {
            return this.base - this.y;
        },
        inRange : function (chartX, chartY) {
            return (chartX >= this.x - this.width / 2 && chartX <= this.x + this.width / 2) && (chartY >= this.y && chartY <= this.base);
        }
    });

    Chart.SquareTooltip = Chart.Tooltip.extend({
        draw : function () {

            var ctx = this.chart.ctx;

            ctx.font = helpers.fontString(this.fontTitleSize, this.fontTitleStyle, this.fontFamily);

            this.xAlign = 'center';
            this.yAlign = 'above';

            //Distance between the actual element.y position and the start of the tooltip caret
            var caretPadding = 20;

            var titleWidth = ctx.measureText(this.title).width,
                measuretextWidth = ctx.measureText(this.text).width,
                textWidth = measuretextWidth < titleWidth ? titleWidth : measuretextWidth,
                tooltipWidth = textWidth + 2 * this.xPadding,
                tooltipRectHeight = this.fontSize + 2 * this.yPadding + this.fontTitleSize - this.lineSpacing,//Looks better
                tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

            if (this.x + tooltipWidth / 2 > this.chart.width) {
                this.xAlign = 'left';
            } else if (this.x - tooltipWidth / 2 < 0) {
                this.xAlign = 'right';
            }

            if (this.y - tooltipHeight < 0) {
                this.yAlign = 'below';
            }

            var tooltipX = this.x - tooltipWidth / 2,
                tooltipY = this.y - tooltipHeight;

            ctx.fillStyle = this.fillColor;

            switch (this.yAlign)
            {
            case 'above':
                //Draw a caret above the x/y
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - caretPadding);
                ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
                ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
                ctx.closePath();
                ctx.fill();
                break;
            case 'below':
                tooltipY = this.y + caretPadding + this.caretHeight;
                //Draw a caret below the x/y
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + caretPadding);
                ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
                ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
                ctx.closePath();
                ctx.fill();
                break;
            }

            switch (this.xAlign)
            {
            case 'left':
                tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
                break;
            case 'right':
                tooltipX = this.x - (this.cornerRadius + this.caretHeight);
                break;
            }

            helpers.drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, this.cornerRadius);

            ctx.fill();

            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.title, tooltipX + tooltipWidth / 2, tooltipY + this.yPadding);

            var xTooltipPos = tooltipX + tooltipWidth / 2;

            if (this.unit) {
                this.text += ' ' + this.unit;
            }
            ctx.font = helpers.fontString(this.fontSize, this.fontStyle, this.fontFamily);
            ctx.fillText(this.text, xTooltipPos, tooltipY + this.yPadding + this.fontTitleSize + this.lineSpacing);
        }
    });

    Chart.SquareMultiTooltip = Chart.MultiTooltip.extend({
        draw : function () {
            helpers.drawRoundedRectangle(this.ctx, this.x, this.y - this.height / 2, this.width, this.height, this.cornerRadius);
            var ctx = this.ctx;
            ctx.fillStyle = this.fillColor;
            ctx.fill();
            ctx.closePath();

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = this.titleTextColor;
            ctx.font = this.titleFont;

            ctx.fillText(this.title, this.x + this.xPadding, this.getLineHeight(0));

            ctx.font = this.font;
            helpers.each(this.labels, function(label, index) {
                ctx.fillStyle = this.textColor;
                ctx.fillText(label, this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

                //A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
                //ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
                //Instead we'll make a white filled block to put the legendColour palette over.

                ctx.fillStyle = this.legendColorBackground;
                ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);

                ctx.fillStyle = this.legendColors[index].fill;
                ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);


            }, this);
        }
    });

    // Extending the Bar Chart to accept 2 new data options, 'activeLabel' and 'activeColor'
    Chart.types.Bar.extend({
        name: 'eqBar',
        initialize: function (data) {

            //Expose options as a scope variable here so we can access it in the ScaleClass
            var options = this.options;

            this.ScaleClass = Chart.xScale.extend({
                offsetGridLines : true,
                showAxisLabels: this.options.showAxisLabels,
                activeLabel : data.activeLabel,
                xLabel : this.options.xLabel,
                yLabel : this.options.yLabel,
                calculateBarX : function (datasetCount, datasetIndex, barIndex) {
                    //Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
                    var xWidth = this.calculateBaseWidth(),
                        xAbsolute = this.calculateX(barIndex) - (xWidth / 2),
                        barWidth = this.calculateBarWidth(datasetCount);

                    return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth / 2;
                },
                calculateBaseWidth : function () {
                    return (this.calculateX(1) - this.calculateX(0)) - (2 * options.barValueSpacing);
                },
                calculateBarWidth : function (datasetCount) {
                    //The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
                    var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);

                    return (baseWidth / datasetCount);
                }
            });

            this.datasets = [];
            this.activeData = {
                label: data.activeLabel,
                color: data.activeColor
            };

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function (evt) {
                    var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

                    this.eachBars(function (bar) {
                        bar.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activeBars, function (activeBar) {
                        activeBar.fillColor = activeBar.highlightFill;
                        activeBar.strokeColor = activeBar.highlightStroke;
                    });
                    this.showTooltip(activeBars);
                });
            }

            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.BarClass = Chart.SlicedRectangle.extend({
                strokeWidth : this.options.barStrokeWidth,
                showStroke : this.options.barShowStroke,
                sliceSize : this.options.sliceSize,
                ctx : this.chart.ctx
            });

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets, function (dataset) {

                var datasetObject = {
                    label : dataset.label || null,
                    fillColor : dataset.fillColor,
                    strokeColor : dataset.strokeColor,
                    bars : []
                };

                this.datasets.push(datasetObject);

                helpers.each(dataset.data, function (dataPoint, index) {
                    if (helpers.isNumber(dataPoint)) {
                        //Add a new point for each piece of data, passing any required data to draw.
                        datasetObject.bars.push(new this.BarClass({
                            value : dataPoint,
                            label : data.labels[index],
                            datasetLabel: dataset.label,
                            strokeColor : dataset.strokeColor,
                            fillColor : dataset.fillColor,
                            highlightFill : dataset.highlightFill || dataset.fillColor,
                            highlightStroke : dataset.highlightStroke || dataset.strokeColor
                        }));
                    }
                }, this);

            }, this);

            this.buildScale(data.labels);

            this.BarClass.prototype.base = this.scale.endPoint;

            this.eachBars(function (bar, index, datasetIndex) {
                helpers.extend(bar, {
                    width : this.scale.calculateBarWidth(this.datasets.length),
                    x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
                    y: this.scale.endPoint
                });
                if (bar.label === this.activeData.label) {
                    bar.fillColor = this.activeData.color;
                }
                bar.save();
            }, this);

            this.render();
        },
        showTooltip : function (ChartElements, forceRedraw) {
            // Only redraw the chart if we've actually changed what we're hovering on.
            if (typeof this.activeElements === 'undefined') {
                this.activeElements = [];
            }

            var isChanged = (function (Elements) {
                var changed = false;

                if (Elements.length !== this.activeElements.length) {
                    changed = true;
                    return changed;
                }

                helpers.each(Elements, function (element, index) {
                    if (element !== this.activeElements[index]) {
                        changed = true;
                    }
                }, this);
                return changed;
            }).call(this, ChartElements);

            if (!isChanged && !forceRedraw) {
                return;
            }
            else {
                this.activeElements = ChartElements;
            }
            this.draw();
            if (ChartElements.length > 0) {
                // If we have multiple datasets, show a MultiTooltip for all of the data points at that index
                helpers.each(ChartElements, function (Element) {
                    var tooltipPosition = Element.tooltipPosition();
                    new Chart.SquareTooltip({
                        x: Math.round(tooltipPosition.x),
                        y: Math.round(tooltipPosition.y),
                        xPadding: this.options.tooltipXPadding,
                        yPadding: this.options.tooltipYPadding,
                        fillColor: this.options.tooltipFillColor,
                        textColor: this.options.tooltipFontColor,
                        fontFamily: this.options.tooltipFontFamily,
                        fontTitleStyle: this.options.tooltipTitleFontStyle,
                        fontStyle: this.options.tooltipFontStyle,
                        fontSize: this.options.tooltipFontSize,
                        fontTitleSize: this.options.tooltipTitleFontSize,
                        fontUnitSize: this.options.tooltipUnitFontSize,
                        lineSpacing: this.options.tooltipLineSpacing,
                        caretHeight: this.options.tooltipCaretSize,
                        cornerRadius: this.options.tooltipCornerRadius,
                        title: helpers.template(this.options.tooltipTitleTemplate, Element),
                        text: helpers.template(this.options.tooltipTemplate, Element),
                        unit: this.options.tooltipUnitTemplate,
                        chart: this.chart
                    }).draw();
                }, this);
            }
            return this;
        }
    });


    Chart.types.Line.extend({
        name: 'eqLine',
        initialize: function (data) {
            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.PointClass = Chart.Point.extend({
                strokeWidth : this.options.pointDotStrokeWidth,
                radius : this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius : this.options.pointHitDetectionRadius,
                ctx : this.chart.ctx,
                inRange : function (mouseX, mouseY) {
                    var poweredRadius = Math.pow(this.radius + this.hitDetectionRadius, 2);
                    return Math.pow(mouseX - this.x, 2) < poweredRadius && Math.pow(mouseY - this.y, 2) < poweredRadius;
                }
            });

            this.datasets = [];

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function (evt) {
                    var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function (point) {
                        point.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activePoints, function (activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets, function (dataset) {

                var datasetObject = {
                    label : dataset.label || null,
                    fillColor : dataset.fillColor,
                    strokeColor : dataset.strokeColor,
                    pointColor : dataset.pointColor,
                    pointStrokeColor : dataset.pointStrokeColor,
                    points : []
                };

                this.datasets.push(datasetObject);

                helpers.each(dataset.data, function (dataPoint, index) {
                    //Best way to do this? or in draw sequence...?
                    if (helpers.isNumber(dataPoint)) {
                        if (dataPoint < 0) {
                            datasetObject.points.push(new this.PointClass({
                                display : false,
                                value : dataPoint * -1,
                                label : data.labels[index],
                                datasetLabel: dataset.label,
                                strokeColor : dataset.pointStrokeColor,
                                fillColor : dataset.pointColor,
                                highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                                highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                            }));
                        } else if (dataPoint === 0) {
                            datasetObject.points.push(new this.PointClass({
                                display : false,
                                value : dataPoint,
                                label : data.labels[index],
                                datasetLabel: dataset.label,
                                strokeColor : dataset.pointStrokeColor,
                                fillColor : dataset.pointColor,
                                highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                                highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                            }));
                        } else {
                            //Add a new point for each piece of data, passing any required data to draw.
                            datasetObject.points.push(new this.PointClass({
                                value : dataPoint,
                                label : data.labels[index],
                                datasetLabel: dataset.label,
                                strokeColor : dataset.pointStrokeColor,
                                fillColor : dataset.pointColor,
                                highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                                highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                            }));
                        }
                    }
                }, this);

                this.buildScale(data.labels);


                this.eachPoints(function (point, index) {
                    helpers.extend(point, {
                        x: this.scale.calculateX(index),
                        y: this.scale.endPoint
                    });
                    point.save();
                }, this);

            }, this);


            this.render();
        },
        getPointsAtEvent: function (e) {
            var pointsArray = [],
                eventPosition = helpers.getRelativePosition(e);
            helpers.each(this.datasets, function (dataset) {
                helpers.each(dataset.points, function (point) {
                    if (point.value > 0) {
                        if (point.inRange(eventPosition.x, eventPosition.y)) {
                            pointsArray.push(point);
                        }
                    }
                });
            }, this);
            return pointsArray;
        },
        showTooltip : function(ChartElements, forceRedraw){
            // Only redraw the chart if we've actually changed what we're hovering on.
            if (typeof this.activeElements === 'undefined') this.activeElements = [];

            var isChanged = (function(Elements){
                var changed = false;

                if (Elements.length !== this.activeElements.length){
                    changed = true;
                    return changed;
                }

                helpers.each(Elements, function(element, index){
                    if (element !== this.activeElements[index]){
                        changed = true;
                    }
                }, this);
                return changed;
            }).call(this, ChartElements);

            if (!isChanged && !forceRedraw){
                return;
            }
            else{
                this.activeElements = ChartElements;
            }
            this.draw();
            if (ChartElements.length > 0){
                // If we have multiple datasets, show a MultiTooltip for all of the data points at that index
                if (this.datasets && this.datasets.length > 1) {
                    var dataArray,
                        dataIndex;

                    for (var i = this.datasets.length - 1; i >= 0; i--) {
                        dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
                        dataIndex = helpers.indexOf(dataArray, ChartElements[0]);
                        if (dataIndex !== -1){
                            break;
                        }
                    }
                    var tooltipLabels = [],
                        tooltipColors = [],
                        medianPosition = (function(index) {

                            // Get all the points at that particular index
                            var Elements = [],
                                dataCollection,
                                xPositions = [],
                                yPositions = [],
                                xMax,
                                yMax,
                                xMin,
                                yMin;
                            helpers.each(this.datasets, function(dataset){
                                dataCollection = dataset.points || dataset.bars || dataset.segments;
                                Elements.push(dataCollection[dataIndex]);
                            });

                            helpers.each(Elements, function(element) {
                                xPositions.push(element.x);
                                yPositions.push(element.y);


                                //Include any colour information about the element
                                tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
                                tooltipColors.push({
                                    fill: element._saved.fillColor || element.fillColor,
                                    stroke: element._saved.strokeColor || element.strokeColor
                                });

                            }, this);

                            yMin = helpers.min(yPositions);
                            yMax = helpers.max(yPositions);

                            xMin = helpers.min(xPositions);
                            xMax = helpers.max(xPositions);

                            return {
                                x: (xMin > this.chart.width/2) ? xMin : xMax,
                                y: (yMin + yMax)/2
                            };
                        }).call(this, dataIndex);

                    new Chart.SquareMultiTooltip({
                        x: medianPosition.x,
                        y: medianPosition.y,
                        xPadding: this.options.tooltipXPadding,
                        yPadding: this.options.tooltipYPadding,
                        xOffset: this.options.tooltipXOffset,
                        fillColor: this.options.tooltipFillColor,
                        textColor: this.options.tooltipFontColor,
                        fontFamily: this.options.tooltipFontFamily,
                        fontStyle: this.options.tooltipFontStyle,
                        fontSize: this.options.tooltipFontSize,
                        titleTextColor: this.options.tooltipTitleFontColor,
                        titleFontFamily: this.options.tooltipTitleFontFamily,
                        titleFontStyle: this.options.tooltipTitleFontStyle,
                        titleFontSize: this.options.tooltipTitleFontSize,
                        cornerRadius: this.options.tooltipCornerRadius,
                        labels: tooltipLabels,
                        legendColors: tooltipColors,
                        legendColorBackground : this.options.multiTooltipKeyBackground,
                        title: helpers.template(this.options.tooltipTitleTemplate, Element) + ChartElements[0].label,
                        unit: this.options.tooltipUnitTemplate,
                        chart: this.chart,
                        ctx: this.chart.ctx
                    }).draw();

                } else {
                    each(ChartElements, function(Element) {
                        var tooltipPosition = Element.tooltipPosition();
                        new Chart.SquareTooltip({
                            x: Math.round(tooltipPosition.x),
                            y: Math.round(tooltipPosition.y),
                            xPadding: this.options.tooltipXPadding,
                            yPadding: this.options.tooltipYPadding,
                            fillColor: this.options.tooltipFillColor,
                            textColor: this.options.tooltipFontColor,
                            fontFamily: this.options.tooltipFontFamily,
                            fontTitleStyle: this.options.tooltipTitleFontStyle,
                            fontStyle: this.options.tooltipFontStyle,
                            fontSize: this.options.tooltipFontSize,
                            fontTitleSize: this.options.tooltipTitleFontSize,
                            fontUnitSize: this.options.tooltipUnitFontSize,
                            lineSpacing: this.options.tooltipLineSpacing,
                            caretHeight: this.options.tooltipCaretSize,
                            cornerRadius: this.options.tooltipCornerRadius,
                            title: helpers.template(this.options.tooltipTitleTemplate, Element),
                            text: helpers.template(this.options.tooltipTemplate, Element),
                            unit: this.options.tooltipUnitTemplate,
                            chart: this.chart
                        }).draw();
                    }, this);
                }
            }
            return this;
        },
        draw: function (ease) {
            var easingDecimal = ease || 1;
            this.clear();

            var ctx = this.chart.ctx;

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            this.scale.draw(easingDecimal);


            helpers.each(this.datasets, function (dataset) {

                //Transition each point first so that the line and point drawing isn't out of sync
                //We can use this extra loop to calculate the control points of this dataset also in this loop

                helpers.each(dataset.points, function (point, index) {
                    point.transition({
                        y : this.scale.calculateY(point.value),
                        x : this.scale.calculateX(index)
                    }, easingDecimal);

                }, this);


                // Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
                // This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
                if (this.options.bezierCurve) {
                    helpers.each(dataset.points, function (point, index) {
                        //If we're at the start or end, we don't have a previous/next point
                        //By setting the tension to 0 here, the curve will transition to straight at the end
                        if (index === 0) {
                            point.controlPoints = helpers.splineCurve(point, point, dataset.points[index + 1], 0);
                        } else if (index >= dataset.points.length - 1) {
                            point.controlPoints = helpers.splineCurve(dataset.points[index - 1], point, point, 0);
                        } else {
                            point.controlPoints = helpers.splineCurve(dataset.points[index - 1], point, dataset.points[index + 1], this.options.bezierCurveTension);
                        }
                    }, this);
                }


                //Draw the line between all the points
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.strokeStyle = dataset.strokeColor;
                ctx.beginPath();
                helpers.each(dataset.points, function (point, index) {
                    if (this.options.hideZeroValues && point.value !== 0 || !this.options.hideZeroValues) {
                        if (index > 0) {
                            if (this.options.bezierCurve) {
                                ctx.bezierCurveTo(
                                    dataset.points[index - 1].controlPoints.outer.x,
                                    dataset.points[index - 1].controlPoints.outer.y,
                                    point.controlPoints.inner.x,
                                    point.controlPoints.inner.y,
                                    point.x,
                                    point.y
                                );
                            } else {
                                ctx.lineTo(point.x, point.y);
                            }

                        } else {
                            ctx.moveTo(point.x, point.y);
                        }
                    }
                }, this);
                ctx.stroke();


                if (this.options.datasetFill) {
                    //Round off the line by going to the base of the chart, back to the start, then fill.
                    ctx.lineTo(dataset.points[dataset.points.length - 1].x, this.scale.endPoint);
                    ctx.lineTo(this.scale.calculateX(0), this.scale.endPoint);
                    ctx.fillStyle = dataset.fillColor;
                    ctx.closePath();
                    ctx.fill();
                }

                //Now draw the points over the line
                //A little inefficient double looping, but better than the line
                //lagging behind the point positions
                helpers.each(dataset.points, function (point) {
                    point.draw();
                });

            }, this);
        },
        buildScale: function (labels) {
            var self = this;

            var dataTotal = function () {
                var values = [];
                self.eachPoints(function (point) {
                    values.push(point.value);
                });

                return values;
            };

            var scaleOptions = {
                labelTrimSeconds : this.options.labelTrimSeconds,
                labelStepping : this.options.labelStepping,
                labelStep : this.options.labelStep,
                showAxisLabels : this.options.showAxisLabels,
                xLabel : this.options.xLabel,
                yLabel : this.options.yLabel,
                templateString : this.options.scaleLabel,
                height : this.chart.height,
                width : this.chart.width,
                ctx : this.chart.ctx,
                textColor : this.options.scaleFontColor,
                fontSize : this.options.scaleFontSize,
                fontStyle : this.options.scaleFontStyle,
                fontFamily : this.options.scaleFontFamily,
                valuesCount : labels.length,
                beginAtZero : this.options.scaleBeginAtZero,
                integersOnly : this.options.scaleIntegersOnly,
                calculateYRange : function (currentHeight) {
                    var updatedRanges = helpers.calculateScaleRange(
                        dataTotal(),
                        currentHeight,
                        this.fontSize,
                        this.beginAtZero,
                        this.integersOnly
                    );
                    helpers.extend(this, updatedRanges);
                },
                xLabels : labels,
                font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth : this.options.scaleLineWidth,
                lineColor : this.options.scaleLineColor,
                gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
                gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : 'rgba(0,0,0,0)',
                padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                showLabels : this.options.scaleShowLabels,
                display : this.options.showScale
            };

            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }


            this.scale = new Chart.xScale(scaleOptions);
        }
    });


    Chart.Type.extend({
        name: 'eqStackedBar',
        defaults : defaultConfig,
        initialize:  function (data) {
            //Expose options as a scope variable here so we can access it in the ScaleClass
            var options = this.options;

            this.ScaleClass = Chart.xScale.extend({
                offsetGridLines : true,
                calculateBarX : function (barIndex) {
                    return this.calculateX(barIndex);
                },
                calculateBarY : function (datasets, dsIndex, barIndex, value) {
                    var offset = 0,
                        sum = 0;

                    for (var i = 0; i < datasets.length; i++) {
                        sum += datasets[i].bars[barIndex].value;
                    }
                    for (i = dsIndex; i < datasets.length; i++) {
                        if (i === dsIndex && value) {
                            offset += value;
                        } else {
                            offset += datasets[i].bars[barIndex].value;
                        }
                    }

                    if (options.relativeBars) {
                        offset = offset / sum * 100;
                    }

                    return this.calculateY(offset);
                },
                calculateBaseWidth : function () {
                    return (this.calculateX(1) - this.calculateX(0)) - (2 * options.barValueSpacing);
                },
                calculateBaseHeight : function () {
                    return (this.calculateY(1) - this.calculateY(0));
                },
                calculateBarWidth : function () {
                    //The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
                    return this.calculateBaseWidth();
                },
                calculateBarHeight : function (datasets, dsIndex, barIndex, value) {
                    var sum = 0;

                    for (var i = 0; i < datasets.length; i++) {
                        sum += datasets[i].bars[barIndex].value;
                    }

                    if (!value) {
                        value = datasets[dsIndex].bars[barIndex].value;
                    }

                    if (options.relativeBars) {
                        value = value / sum * 100;
                    }

                    return this.calculateY(value);
                }
            });

            this.datasets = [];

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function (evt) {
                    var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

                    this.eachBars(function (bar) {
                        bar.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activeBars, function (activeBar) {
                        activeBar.fillColor = activeBar.highlightFill;
                        activeBar.strokeColor = activeBar.highlightStroke;
                    });
                    this.showTooltip(activeBars);
                });
            }

            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.BarClass = Chart.Rectangle.extend({
                strokeWidth : this.options.barStrokeWidth,
                showStroke : this.options.barShowStroke,
                ctx : this.chart.ctx
            });

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets, function (dataset) {

                var datasetObject = {
                    label : dataset.label || null,
                    fillColor : dataset.fillColor,
                    strokeColor : dataset.strokeColor,
                    bars : []
                };

                this.datasets.push(datasetObject);

                helpers.each(dataset.data, function (dataPoint, index) {
                    if (helpers.isNumber(dataPoint)) {
                        //Add a new point for each piece of data, passing any required data to draw.
                        datasetObject.bars.push(new this.BarClass({
                            value : dataPoint,
                            label : data.labels[index],
                            datasetLabel: dataset.label,
                            strokeColor : dataset.strokeColor,
                            fillColor : dataset.fillColor,
                            highlightFill : dataset.highlightFill || dataset.fillColor,
                            highlightStroke : dataset.highlightStroke || dataset.strokeColor
                        }));
                    }
                }, this);

            }, this);

            this.buildScale(data.labels);

            this.eachBars(function (bar, index) {
                helpers.extend(bar, {
                    base: this.scale.endPoint,
                    height: 0,
                    width : this.scale.calculateBarWidth(this.datasets.length),
                    x: this.scale.calculateBarX(index),
                    y: this.scale.endPoint
                });
                bar.save();
            }, this);

            this.render();
        },
        update : function () {
            this.scale.update();
            // Reset any highlight colours before updating.
            helpers.each(this.activeElements, function (activeElement) {
                activeElement.restore(['fillColor', 'strokeColor']);
            });

            this.eachBars(function (bar) {
                bar.save();
            });
            this.render();
        },
        eachBars : function (callback) {
            helpers.each(this.datasets, function (dataset, datasetIndex) {
                helpers.each(dataset.bars, callback, this, datasetIndex);
            }, this);
        },
        getBarsAtEvent : function (e) {
            var barsArray = [],
                eventPosition = helpers.getRelativePosition(e),
                datasetIterator = function (dataset) {
                    barsArray.push(dataset.bars[barIndex]);
                },
                barIndex;

            for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
                for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
                    if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x, eventPosition.y)) {
                        helpers.each(this.datasets, datasetIterator);
                        return barsArray;
                    }
                }
            }

            return barsArray;
        },
        buildScale : function (labels) {
            var self = this;

            var dataTotal = function () {
                var values = [];
                helpers.each(self.datasets, function (dataset) {
                    helpers.each(dataset.bars, function (bar, barIndex) {
                        if (!values[barIndex]) {
                            values[barIndex] = 0;
                        }
                        if (self.options.relativeBars) {
                            values[barIndex] = 100;
                        } else {
                            values[barIndex] += bar.value;
                        }
                    });
                });
                return values;
            };

            var scaleOptions = {
                showAxisLabels: this.options.showAxisLabels,
                xLabel : this.options.xLabel,
                yLabel : this.options.yLabel,
                templateString : this.options.scaleLabel,
                height : this.chart.height,
                width : this.chart.width,
                ctx : this.chart.ctx,
                textColor : this.options.scaleFontColor,
                fontSize : this.options.scaleFontSize,
                fontStyle : this.options.scaleFontStyle,
                fontFamily : this.options.scaleFontFamily,
                valuesCount : labels.length,
                beginAtZero : this.options.scaleBeginAtZero,
                integersOnly : this.options.scaleIntegersOnly,
                calculateYRange: function (currentHeight) {
                    var updatedRanges = helpers.calculateScaleRange(
                        dataTotal(),
                        currentHeight,
                        this.fontSize,
                        this.beginAtZero,
                        this.integersOnly
                    );
                    helpers.extend(this, updatedRanges);
                },
                xLabels : labels,
                font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth : this.options.scaleLineWidth,
                lineColor : this.options.scaleLineColor,
                gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
                gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : 'rgba(0,0,0,0)',
                padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
                showLabels : this.options.scaleShowLabels,
                display : this.options.showScale
            };

            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }

            this.scale = new this.ScaleClass(scaleOptions);
        },
        addData : function (valuesArray, label) {
            //Map the values array for each of the datasets
            helpers.each(valuesArray, function (value, datasetIndex) {
                if (helpers.isNumber(value)) {
                    //Add a new point for each piece of data, passing any required data to draw.
                    this.datasets[datasetIndex].bars.push(new this.BarClass({
                        value : value,
                        label : label,
                        x: this.scale.calculateBarX(this.scale.valuesCount + 1),
                        y: this.scale.endPoint,
                        width : this.scale.calculateBarWidth(this.datasets.length),
                        base : this.scale.endPoint,
                        strokeColor : this.datasets[datasetIndex].strokeColor,
                        fillColor : this.datasets[datasetIndex].fillColor
                    }));
                }
            }, this);

            this.scale.addXLabel(label);
            //Then re-render the chart.
            this.update();
        },
        removeData : function () {
            this.scale.removeXLabel();
            //Then re-render the chart.
            helpers.each(this.datasets, function (dataset) {
                dataset.bars.shift();
            }, this);
            this.update();
        },
        reflow : function () {
            helpers.extend(this.BarClass.prototype, {
                y: this.scale.endPoint,
                base : this.scale.endPoint
            });
            var newScaleProps = helpers.extend({
                height : this.chart.height,
                width : this.chart.width
            });
            this.scale.update(newScaleProps);
        },
        draw : function (ease) {
            var easingDecimal = ease || 1;
            this.clear();

            this.scale.draw(easingDecimal);

            //Draw all the bars for each dataset
            helpers.each(this.datasets, function (dataset, datasetIndex) {
                helpers.each(dataset.bars, function (bar, index) {
                    var y = this.scale.calculateBarY(this.datasets, datasetIndex, index, bar.value),
                        height = this.scale.calculateBarHeight(this.datasets, datasetIndex, index, bar.value);

                    //Transition then draw
                    bar.transition({
                        base : this.scale.endPoint - (Math.abs(height) - Math.abs(y)),
                        x : this.scale.calculateBarX(index),
                        y : Math.abs(y),
                        height : Math.abs(height),
                        width : this.scale.calculateBarWidth(this.datasets.length)
                    }, easingDecimal).draw();
                }, this);
            }, this);
        }
    });

    Chart.types.Line.extend({
        name : 'eqLinear',
        pointDotStroke : false,
        datasetStroke : false,
        initialize : function (data) {
            //Declare the extension of the default point, to cater for the options passed in to the constructor
            this.PointClass = Chart.Point.extend({
                strokeWidth : this.options.pointDotStrokeWidth,
                radius : this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius : this.options.pointHitDetectionRadius,
                ctx : this.chart.ctx,
                inRange : function (mouseX) {
                    return (Math.pow(mouseX - this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius, 2));
                }
            });

            this.datasets = [];
            this.options.activeLabel = data.activeLabel;
            this.options.activePoint = data.activePoint;

            //Set up tooltip events on the chart
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function (evt) {
                    var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function (point) {
                        point.restore(['fillColor', 'strokeColor']);
                    });
                    helpers.each(activePoints, function (activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }

            //Iterate through each of the datasets, and build this into a property of the chart
            helpers.each(data.datasets, function (dataset) {

                var datasetObject = {
                    label : dataset.label || null,
                    fillColor : dataset.fillColor,
                    strokeColor : dataset.strokeColor,
                    pointColor : dataset.pointColor,
                    pointStrokeColor : dataset.pointStrokeColor,
                    points : []
                };

                this.datasets.push(datasetObject);


                helpers.each(dataset.data, function (dataPoint, index) {
                    //Best way to do this? or in draw sequence...?
                    if (helpers.isNumber(dataPoint)) {
                        if (dataPoint < 0) {
                            datasetObject.points.push(new this.PointClass({
                                display : false,
                                value : dataPoint * -1,
                                label : data.labels[index],
                                datasetLabel: dataset.label,
                                strokeColor : dataset.pointStrokeColor,
                                fillColor : dataset.pointColor,
                                highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                                highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                            }));
                        } else if (dataPoint === 0) {
                            datasetObject.points.push(new this.PointClass({
                                display : false,
                                value : dataPoint,
                                label : data.labels[index],
                                datasetLabel: dataset.label,
                                strokeColor : dataset.pointStrokeColor,
                                fillColor : dataset.pointColor,
                                highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                                highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                            }));
                        } else {
                            //Add a new point for each piece of data, passing any required data to draw.
                            datasetObject.points.push(new this.PointClass({
                                value : dataPoint,
                                label : data.labels[index],
                                datasetLabel: dataset.label,
                                strokeColor : dataset.pointStrokeColor,
                                fillColor : dataset.pointColor,
                                highlightFill : dataset.pointHighlightFill || dataset.pointColor,
                                highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
                            }));
                        }
                    }
                }, this);

                this.buildScale(data.labels);


                this.eachPoints(function (point, index) {
                    helpers.extend(point, {
                        x: this.scale.calculateX(index),
                        y: this.scale.endPoint
                    });
                    point.save();
                }, this);

            }, this);


            this.render();
        },
        getPointsAtEvent : function (e) {
            var pointsArray = [],
                eventPosition = helpers.getRelativePosition(e);
            helpers.each(this.datasets, function (dataset) {
                helpers.each(dataset.points, function (point) {
                    if (point.value > 0 && point.display) {
                        if (point.inRange(eventPosition.x, eventPosition.y)) {
                            pointsArray.push(point);
                        }
                    }
                });
            }, this);
            return pointsArray;
        },
        buildScale : function (labels) {
            var self = this;

            var dataTotal = function () {
                var values = [];
                self.eachPoints(function (point) {
                    values.push(point.value);
                });

                return values;
            };

            var scaleOptions = {
                showAxisLabels: this.options.showAxisLabels,
                xLabel : this.options.xLabel,
                yLabel : this.options.yLabel,
                activeLabel : this.options.activeLabel,
                templateString : this.options.scaleLabel,
                height : this.chart.height,
                width : this.chart.width,
                ctx : this.chart.ctx,
                textColor : this.options.scaleFontColor,
                fontSize : this.options.scaleFontSize,
                fontStyle : this.options.scaleFontStyle,
                fontFamily : this.options.scaleFontFamily,
                valuesCount : labels.length,
                beginAtZero : this.options.scaleBeginAtZero,
                integersOnly : this.options.scaleIntegersOnly,
                calculateYRange : function (currentHeight) {
                    var updatedRanges = helpers.calculateScaleRange(
                        dataTotal(),
                        currentHeight,
                        this.fontSize,
                        this.beginAtZero,
                        this.integersOnly
                    );
                    helpers.extend(this, updatedRanges);
                },
                xLabels : labels,
                font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth : this.options.scaleLineWidth,
                lineColor : this.options.scaleLineColor,
                gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
                gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : 'rgba(0,0,0,0)',
                padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                showLabels : this.options.scaleShowLabels,
                display : this.options.showScale
            };

            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
                });
            }


            this.scale = new Chart.xScale(scaleOptions);
        },
        showTooltip : function (ChartElements, forceRedraw) {
            // Only redraw the chart if we've actually changed what we're hovering on.
            if (typeof this.activeElements === 'undefined') {
                this.activeElements = [];
            }

            var isChanged = (function (Elements) {
                var changed = false;

                if (Elements.length !== this.activeElements.length) {
                    changed = true;
                    return changed;
                }

                helpers.each(Elements, function (element, index) {
                    if (element === undefined) {
                        if (element !== this.activeElements[index]) {
                            changed = true;
                        }
                    }
                }, this);
                return changed;
            }).call(this, ChartElements);

            if (!isChanged && !forceRedraw) {
                return;
            }
            else {
                this.activeElements = ChartElements;
            }
            this.draw();
            if (ChartElements.length > 0) {
                // If we have multiple datasets, show a MultiTooltip for all of the data points at that index
                helpers.each(ChartElements, function (Element) {
                    var tooltipPosition = Element.tooltipPosition();
                    new Chart.SquareTooltip({
                        x: Math.round(tooltipPosition.x),
                        y: Math.round(tooltipPosition.y),
                        xPadding: this.options.tooltipXPadding,
                        yPadding: this.options.tooltipYPadding,
                        fillColor: this.options.tooltipFillColor,
                        textColor: this.options.tooltipFontColor,
                        fontFamily: this.options.tooltipFontFamily,
                        fontTitleStyle: this.options.tooltipTitleFontStyle,
                        fontStyle: this.options.tooltipFontStyle,
                        fontSize: this.options.tooltipFontSize,
                        fontTitleSize: this.options.tooltipTitleFontSize,
                        fontUnitSize: this.options.tooltipUnitFontSize,
                        lineSpacing: this.options.tooltipLineSpacing,
                        caretHeight: this.options.tooltipCaretSize,
                        cornerRadius: this.options.tooltipCornerRadius,
                        title: helpers.template(this.options.tooltipTitleTemplate, Element),
                        text: helpers.template(this.options.tooltipTemplate, Element),
                        unit: this.options.tooltipUnitTemplate,
                        chart: this.chart
                    }).draw();
                }, this);
            }
            return this;
        },
        draw : function (ease) {
            var easingDecimal = ease || 1;
            var options = this.options;
            this.clear();

            var ctx = this.chart.ctx;

            this.scale.draw(easingDecimal);


            helpers.each(this.datasets, function (dataset) {

                //Transition each point first so that the line and point drawing isn't out of sync
                //We can use this extra loop to calculate the control points of this dataset also in this loop

                helpers.each(dataset.points, function (point, index) {
                    point.transition({
                        y : this.scale.calculateY(point.value),
                        x : this.scale.calculateX(index)
                    }, easingDecimal);

                }, this);


                // Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
                // This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
                if (this.options.bezierCurve) {
                    helpers.each(dataset.points, function (point, index) {
                        //If we're at the start or end, we don't have a previous/next point
                        //By setting the tension to 0 here, the curve will transition to straight at the end
                        if (index === 0) {
                            point.controlPoints = helpers.splineCurve(point, point, dataset.points[index + 1], 0);
                        }
                        else if (index >= dataset.points.length - 1) {
                            point.controlPoints = helpers.splineCurve(dataset.points[index - 1], point, point, 0);
                        }
                        else {
                            point.controlPoints = helpers.splineCurve(dataset.points[index - 1], point, dataset.points[index + 1], this.options.bezierCurveTension);
                        }
                    }, this);
                }


                //Draw the line between all the points
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.strokeStyle = dataset.strokeColor;
                ctx.beginPath();
                ctx.setLineDash([]);
                helpers.each(dataset.points, function (point, index) {
                    if (point.value !== 0) {
                        if (index > 0) {
                            if (this.options.bezierCurve) {
                                ctx.bezierCurveTo(
                                    dataset.points[index - 1].controlPoints.outer.x,
                                    dataset.points[index - 1].controlPoints.outer.y,
                                    point.controlPoints.inner.x,
                                    point.controlPoints.inner.y,
                                    point.x,
                                    point.y
                                );
                            } else {
                                ctx.lineTo(point.x, point.y);
                            }

                        } else {
                            ctx.moveTo(point.x, point.y);
                        }
                    }
                }, this);
                ctx.stroke();

                if (this.options.datasetFill) {
                    //Round off the line by going to the base of the chart, back to the start, then fill.
                    ctx.lineTo(dataset.points[dataset.points.length - 1].x, this.scale.endPoint);
                    ctx.lineTo(this.scale.calculateX(0), this.scale.endPoint);
                    ctx.fillStyle = dataset.fillColor;
                    ctx.closePath();
                    ctx.fill();
                }

                //Now draw the points over the line
                //A little inefficient double looping, but better than the line
                //lagging behind the point positions
                helpers.each(dataset.points, function (point, index) {
                    if (index === options.activePoint) {
                        point.radius = options.pointDotRadius + 8;
                        point.fillColor = options.pointAreaColor;
                        point.strokeColor = 'rgba(255,255,255,.0)';
                        point.draw();
                        point.radius = options.pointDotRadius + 16;
                        point.draw();
                        point.restore(['fillColor', 'strokeColor']);
                        point.radius = options.pointDotRadius;
                    }
                    point.draw();
                });

            }, this);
        }
    });

    module.exports = Chart;
});

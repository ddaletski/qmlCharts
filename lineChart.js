var Line = function(ctx) {
    var labels = []
    var options = {}
    var size = 0         // labels count (x-axis size)
    var bottom = 0       // drawing area bottom y-value
    var top = 0
    var left = 0          // drawing area left x-value
    var right = 0
    var drawingHeight = 0
    var drawingWidth = 0

    var xStep = 0               // x-axis step in pixels
    var yStep = 0               // y-axis step in pixels
    var scaleStep = 0           // y-axis step (value)
    var indicatorY = 0          // peaks indicator y-value
    var scaleLabels = []        // scale labels (templatized)
    var scaleLabelsWidth = 0    // pixel width of scale labels
    var labelsHeight = 0        // pixel height of labels (x-axis)
    var labelsLeftOffset = 0
    var labelsRightOffset = 0
    var rotateLabels = false
    var labelsStep = 1          // 1 - show every, 2 - every second ...

    var defaults = {
        style: "-", // - line; = fill; 0 points
        lineColor: Qt.rgba(0.1, 0.1, 0.1, 0.7),
        fillColor: Qt.rgba(0.2, 0.2, 0.2, 0.7),
        pointColor: Qt.rgba(0, 0, 0, 0.7),
        pointFillColor: Qt.rgba(0.2, 0.2, 0.2, 0.7),
        lineWidth: 2,
        pointRadius: 3,
        pointBorderWidth: 1
    }

    this.resize = function(width, height, lbls, opts) {
        labels = lbls
        options = opts
        size = labels.length
        if(options.scaleSteps < 2) {
            options.scaleSteps = 2
        }
        if(options.showScaleLabels) {
            populateScaleLabels()
        }
        if(options.showLabels) {
            calculateLabelsSize()
        }
        bottom = Math.floor(height - options.scaleFontSize -
                            labelsHeight - options.bottomMargin) + 0.5

        top = Math.floor(options.scaleFontSize / 2 + 1 + options.peaksIndicatorHeight +
                options.peaksIndicatorOffset + options.topMargin) + 0.5

        right = Math.floor(width - 5 - labelsRightOffset -
                           options.rightMargin) + 0.5

        left = 10 + Math.floor(Math.max(scaleLabelsWidth, labelsLeftOffset) +
                               options.leftMargin) + 0.5

        xStep = (right - left) / (size - 1)
        yStep = (bottom - top) / (options.scaleSteps - 1)
        drawingHeight = bottom - top
        drawingWidth = right - left
        indicatorY = Math.floor(top - options.peaksIndicatorHeight / 2 -
                options.peaksIndicatorOffset) + 0.5
    }

    this.drawScale = function(progress) {
        if(options.showGrid) {
            ctx.strokeStyle = options.gridColor
            ctx.lineWidth = options.gridLineWidth

            ctx.beginPath()
            for(var i = 1; i < scaleLabels.length; ++i) {
                ctx.moveTo(left, Math.floor(bottom - i * yStep) + 0.5)
                ctx.lineTo(right, Math.floor(bottom - i * yStep) + 0.5)
            }
            ctx.stroke()
        }

       if(options.showScaleLines) {
            ctx.lineWidth = options.scaleLineWidth
            ctx.strokeStyle = options.scaleLineColor
            ctx.beginPath()
            ctx.moveTo(left, Math.floor(top - options.scaleLineWidth / 2) + 0.5)
            ctx.lineTo(left, bottom)
            ctx.lineTo(right, bottom)
            ctx.lineTo(right, top)
            ctx.stroke()
        }

       if(options.showScaleLabels) {
           ctx.font = "" + options.scaleFontSize + "px " +
                   options.scaleFontFamily
           ctx.fillStyle = options.scaleFontColor
           ctx.textBaseline = "middle"
           ctx.textAlign = "end"

           ctx.strokeStyle = options.scaleLineColor
           ctx.lineWidth = options.scaleLineWidth

           ctx.beginPath()
           for(var i = 0; i < scaleLabels.length; ++i) {
               ctx.fillText(scaleLabels[i], left - 10,
                            Math.floor(bottom - i * yStep) + 0.5) // FL
               ctx.moveTo(left - 5, Math.floor(bottom - i * yStep) + 0.5)
               ctx.lineTo(left, Math.floor(bottom - i * yStep) + 0.5)
           }
           ctx.stroke()
       }

       if(options.showLabels) {
            var labelY
            ctx.lineWidth = options.scaleLineWidth
            ctx.strokeStyle = options.scaleLineColor
            ctx.fillStyle = options.labelsFontColor
            ctx.font = "" + options.labelsFontSize + "px " +
                    options.labelsFontFamily
            ctx.textBaseline = "middle"
            ctx.beginPath()

            if(!rotateLabels) {
                labelY = bottom + options.labelsFontSize + 3
                ctx.textAlign = "center"
                for(var i = 0; i < size; i += labelsStep) {
                    ctx.moveTo(xPos(i), bottom)
                    ctx.lineTo(xPos(i), bottom + 5)
                    ctx.fillText(labels[i], xPos(i), labelY)
                }
                ctx.stroke()
            } else {
                ctx.textAlign = "end"
                labelY = Math.floor(bottom + options.labelsFontSize / 2)
                for(var i = 0; i < size; i += labelsStep) {
                    ctx.moveTo(xPos(i), bottom)
                    ctx.lineTo(xPos(i), bottom + 5)
                    ctx.save()
                    ctx.translate(xPos(i), labelY);
                    ctx.rotate(-Math.PI/4)
                    ctx.fillText(labels[i], 0, 0)
                    ctx.restore()
                }
                ctx.stroke()
            }
        }
    }


    this.drawLines = function(linesData) {
        if(!linesData) {
            return
        }

        for(var i = 0; i < linesData.length; ++i) {
            var data = linesData[i]

            if(!data.values || data.values.length != size) {
                return
            }

            var style = data.style ? data.style : defaults.style
            ctx.lineWidth = data.lineWidth ? data.lineWidth :
                                                defaults.lineWidth
            ctx.strokeStyle = data.lineColor ? data.lineColor :
                                                  defaults.lineColor
            ctx.beginPath()
            ctx.moveTo(left, yPos(data.values, 0))

            if(options.spline) {
                for(var j = 1; j < size; ++j) {
                    ctx.bezierCurveTo(xPos(j-0.5), yPos(data.values, j-1),
                                      xPos(j-0.5), yPos(data.values, j),
                                      xPos(j), yPos(data.values, j))
                }
            } else {
                for(var j = 1; j < size; ++j) {
                    ctx.lineTo(xPos(j), yPos(data.values, j))
                }
            }

            if(containsSymbol(style, "-")) {
                ctx.stroke()
            }

            if(containsSymbol(style, "=")) {
                ctx.fillStyle = data.fillColor ? data.fillColor :
                                                    defaults.fillColor
                ctx.lineTo(right, bottom)
                ctx.lineTo(left, bottom)
                ctx.fill()
            }

            if(containsSymbol(style, "0")) {
                ctx.fillStyle = data.pointFillColor ? data.pointFillColor :
                                                         defaults.pointFillColor
                ctx.strokeStyle = data.pointColor ?
                            data.pointColor : defaults.pointColor

                ctx.lineWidth = data.pointBorderWidth ? data.pointBorderWidth :
                                                        defaults.pointBorderWidth
                var pointRadius = data.pointRadius ? data.pointRadius :
                                                     defaults.pointRadius

                for(var j = 0; j < size; ++j) {
                    ctx.beginPath()
                    ctx.arc(xPos(j), yPos(data.values, j), pointRadius,
                            0, 2 * Math.PI);
                    ctx.stroke()
                    ctx.fill()
                }
            }
        }
    }

    this.drawPeaks = function(data) {
        ctx.beginPath()
        ctx.moveTo(left, indicatorY)
        ctx.lineWidth = options.peaksIndicatorHeight
        ctx.strokeStyle = options.peaksBackgroundColor
        ctx.lineTo(right, indicatorY)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = options.peaksIndicatorHeight
        ctx.strokeStyle = options.peaksColor

        if(data[0]) {
            ctx.moveTo(left, indicatorY)
            ctx.lineTo(xPos(0.5), indicatorY)
        }

        for(var i = 1; i < size - 1; ++i) {
            if(data[i]) {
                ctx.moveTo(xPos(i - 0.5), indicatorY)
                ctx.lineTo(xPos(i + 0.5), indicatorY)
            }
        }

        if(data[size - 1]) {
            ctx.moveTo(xPos(size - 1.5), indicatorY)
            ctx.lineTo(right, indicatorY)
        }
        ctx.stroke()
    }

    ////////////////////////////////////////////////////////
    // helpers ////////////////////////////////////////////

    var xPos = function (idx) {
        return Math.ceil(left + idx * xStep) + 0.5
    }

    var yPos = function (data, idx) {
        return bottom - (data[idx] * drawingHeight) /
                (options.scaleMaxValue - options.scaleMinValue)
    }

    function populateScaleLabels() {
        // templatize scale labels and calculate its width
        scaleLabels = []
        scaleLabelsWidth = 0
        var currentWidth = 0
        scaleStep = (options.scaleMaxValue - options.scaleMinValue) /
                (options.scaleSteps - 1)

        for(var i = 0; i < options.scaleSteps; ++i) {
            scaleLabels[i] = tmpl(options.scaleLabelTemplate, {
                                      value: options.scaleMinValue + i * scaleStep,
                                      minValue: options.scaleMinValue,
                                      maxValue: options.scaleMaxValue})

            currentWidth = scaleLabels[i].length
            scaleLabelsWidth = Math.max(currentWidth, scaleLabelsWidth)
        }

        scaleLabelsWidth = Math.floor(scaleLabelsWidth *
                                      options.scaleFontSize * 0.9)
    }

    function labelWidth(idx) {
        return Math.floor(options.labelsFontSize * 0.65 *
                          ("" + labels[idx]).length)
    }

    function calculateLabelsSize() {
        labelsStep = 1
        var totalLength = 0
        var totalWidth = 0
        var maxLength = 0
        var maxWidth = 0
        var currentLength = 0
        for(var i = 0; i < size; ++i) {
            currentLength = ("" + labels[i]).length
            totalLength += currentLength
            maxLength = Math.max(currentLength, maxLength)
        }
        maxWidth = Math.floor(maxLength * options.labelsFontSize * 0.75) + 0.5
        totalWidth = Math.floor(totalLength * options.labelsFontSize * 0.75) + 0.5

        if(maxLength <= 1) {
            rotateLabels = false
            labelsHeight = options.labelsFontSize
            labelsLeftOffset = Math.floor(labelWidth(0) / 2) + 0.5
            labelsRightOffset = Math.floor(labelWidth(size-1) / 2) + 0.5
            labelsStep = Math.max(Math.ceil(size * maxWidth /
                                (ctx.canvas.width - scaleLabelsWidth - 10)), 1)
        } else {
            rotateLabels = true
            labelsHeight = Math.SQRT1_2 * maxWidth
            labelsLeftOffset = labelsHeight
            labelsRightOffset = Math.floor(options.labelsFontSize / 2) + 0.5
            labelsStep = Math.max(Math.ceil(size * options.labelsFontSize /
                                (ctx.canvas.width - scaleLabelsWidth - 10)), 1)
        }
        console.log("ST ", labelsStep)
    }

    function containsSymbol(str, symbol) {
        for(var i = 0; i < str.length; ++i) {
            if(str[i] == symbol)
                return true
        }
        return false
    }

    var cache = {};

    function tmpl(str, data) {
        var fn = new Function("obj",
                              "var p=[],print=function() {p.push.apply(p,arguments);};" +
                              "with(obj) {p.push('" +
                              str
                              .replace(/[\r\t\n]/g, " ")
                              .split("<%").join("\t")
                              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                              .replace(/\t=(.*?)%>/g, "',$1,'")
                              .split("\t").join("');")
                              .split("%>").join("p.push('")
                              .split("\r").join("\\'")
                              + "');}return p.join('');");
        return data ? fn( data ) : fn;
    }
}

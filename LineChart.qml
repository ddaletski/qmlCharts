import QtQuick 2.7
import "lineChart.js" as Chart

Item {
    id: root
    property var labels: []
    readonly property int chartSize: labels.length
    readonly property int linesCount: chartData.length
    property var chartData: []
    property bool showPeaksIndicator: false
    property double peaksIndicatorThreshold: 0.9
    property bool running: true

    property Component background: Component {
        Item {}
    }

    property int leftMargin: 0
    property int rightMargin: 0
    property int topMargin: 0
    property int bottomMargin: 0

    property bool spline: true
    property bool showScaleLines: true
    property int scaleLineWidth: 1
    property string scaleLineColor: "gray"
    property bool showGrid: false
    property string gridColor: "gray"
    property int gridLineWidth: 1
    property int peaksIndicatorHeight: 1
    property int peaksIndicatorOffset: 0
    property string peaksColor: "red"
    property string peaksBackgroundColor: "gray"
    property bool showScaleLabels: true
    property string scaleLabelTemplate: "<%=value%>"
    property int scaleMinValue: 0
    property int scaleMaxValue: 1
    property int scaleSteps: 3
    property int scaleFontSize: 14
    property string scaleFontColor: "steelblue"
    property string scaleFontFamily: "Roboto"
    property bool showLabels: true
    property string labelTemplate: "<%=value%>"
    property int labelsFontSize: 14
    property string labelsFontColor: "steelblue"
    property string labelsFontFamily: "Roboto"

    Loader {
        id: bg
        anchors.fill: parent
        sourceComponent: background
    }

    Canvas {
        id: canvas
        anchors.fill: parent
        property var chart
        property var ctx
        property var options: defaultOptions()

        onPaint: {
            if(running) {
                ctx.reset()
                drawScale()
                drawLines()
            }
        }

        onWidthChanged: {
            resize()
            requestPaint()
        }

        onHeightChanged: {
            resize()
            requestPaint()
        }

        function drawScale() {
            chart.drawScale()
        }

        function drawLines() {
            canvas.chart.drawLines(chartData)
            if(showPeaksIndicator) {
                canvas.chart.drawPeaks(getPeaksData())
            }
        }

        function resize() {
            if(chart) {
                chart.resize(canvas.width, canvas.height, root.labels, options)
            }
        }

        function init() {
            if(ctx) {
                chart = new Chart.Line(ctx, root.labels, options)
                resize()
                requestPaint()
            }
        }

        function defaultOptions() {
            var opts = {
                topMargin: topMargin,
                leftMargin: leftMargin,
                bottomMargin: bottomMargin,
                rightMargin: rightMargin,
                spline: spline,
                showScaleLines: showScaleLines,
                scaleLineWidth: scaleLineWidth,
                scaleLineColor: scaleLineColor,
                showGrid: showGrid,
                gridColor: gridColor,
                gridLineWidth: gridLineWidth,
                peaksIndicatorHeight: peaksIndicatorHeight,
                peaksIndicatorOffset: peaksIndicatorOffset,
                peaksColor: peaksColor,
                peaksBackgroundColor: peaksBackgroundColor,
                showScaleLabels: showScaleLabels,
                scaleLabelTemplate: scaleLabelTemplate,
                scaleMinValue: scaleMinValue,
                scaleMaxValue: scaleMaxValue,
                scaleSteps: scaleSteps,
                scaleFontSize: scaleFontSize,
                scaleFontColor: scaleFontColor,
                scaleFontFamily: scaleFontFamily,
                showLabels: showLabels,
                labelTemplate: labelTemplate,
                labelsFontSize: labelsFontSize,
                labelsFontColor: labelsFontColor,
                labelsFontFamily: labelsFontFamily
            }
            return opts
        }

        function getPeaksData() {
            var peaks = []
            peaks.length = chartSize
            for(var i = 0; i < chartSize; ++i) {
                peaks[i] = false
                for(var j = 0; j < linesCount; ++j) {
                    if(chartData[j].values && chartData[j].values[i] >
                            peaksIndicatorThreshold) {
                        peaks[i] = true
                        break
                    }
                }
            }
            return peaks
        }

        onAvailableChanged: {
            if(available)  {
                ctx = canvas.getContext("2d")
                init()
            }
        }

        onOptionsChanged: {
            resize()
            requestPaint()
        }
    }

    onRunningChanged: {
        if(running) {
            canvas.requestPaint()
        }
    }

    onChartDataChanged: {
        if(chartData) {
            canvas.requestPaint()
        }
    }

    onLabelsChanged: {
        if(labels) {
            canvas.resize()
            canvas.requestPaint()
        }
    }

    onShowPeaksIndicatorChanged: {
        canvas.resize()
        canvas.requestPaint()
    }

    onPeaksIndicatorThresholdChanged: {
        canvas.resize()
        canvas.requestPaint()
    }
}

/*
Programming Fundamentals - Lession 8 - Excerise

Dependence:
- JQuery 3
*/

// Global declaration
var TBL_WIDTH = 10;
var TBL_HEIGHT = 10;
var RAND_FROM = 1;
var RAND_TO = 99;

var COLOR_SCALE_START = '#ffa600';
var COLOR_SCALE_END = '#028347';

// Helper function from Internet
// ---------------------------------

/**
 * HEX Color to RGB Color
 * See: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 * @param {string} hex Hex color (e.g. #112233)
 * @returns {Object} Object contains 3 compoent: .r, .g, .b
 */
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * RGB value to Hex Color
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Returns a single rgb color interpolation between given rgb color
// based on the factor given; via https://codepen.io/njmcode/pen/axoyD?editors=0010
// NOTE: Modify version that color is an object with key/prop: .r/.g/.b
function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) {
        factor = 0.5;
    }
    // var result = color1.slice();
    // for (var i = 0; i < 3; i++) {
    //     result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    // }
    var result = {
        r: Math.round(color1.r + factor * (color2.r - color1.r)),
        g: Math.round(color1.g + factor * (color2.g - color1.g)),
        b: Math.round(color1.b + factor * (color2.b - color1.b)),
    }
    return result;
};

// ---------------------------------

/**
 * Create 2D Array with random integers
 * @param {number} colSize
 * @param {number} rowSize
 * @param {number} randNumFrom
 * @param {number} randNumTo
 * @returns {Array} 2D array
 */
function create2dArrRandInt(colSize, rowSize, randNumFrom, randNumTo) {
    var range = randNumTo - randNumFrom + 1;
    var rows = new Array(rowSize);
    for (var i = 0; i < rowSize; i++) {
        var cols = new Array(colSize);
        for (var j = 0; j < colSize; j++) {
            var rInt = parseInt(randNumFrom + (Math.random() * range));
            cols[j] = rInt;
        }
        rows[i] = cols;
    }
    return rows;
}

/**
 * Create Multiple Table in 2D Array
 * @param {number} colSize
 * @param {number} rowSize
 * @returns {Array} 2D array
 */
function create2dArrMultipleTable(colSize, rowSize) {
    var rows = new Array(rowSize);
    for (var i = 0; i < rowSize; i++) {
        var cols = new Array(colSize);
        for (var j = 0; j < colSize; j++) {
            cols[j] = (i + 1) * (j + 1);
        }
        rows[i] = cols;
    }
    return rows;
}

/**
 * Convert 2D Array to table
 * @param {Array} arrData The 2D Array 
 * @returns {JQuery} The Table in JQuery
 */
function conv2DArrtoTable(arrData) {
    var $tbl = $('<table>').addClass('tbl-2d-data');
    if (Array.isArray(arrData) && arrData.length > 0) {
        // For each row:
        for (var i = 0; i < arrData.length; i++) {
            var $row = $('<tr>');

            // if the row is array and size > 0, process
            // NOTE: It is possible the size of the rows are different, think about this. 
            if (Array.isArray(arrData[i]) && arrData[i].length > 0) {
                for (var j = 0; j < arrData.length; j++) {
                    var $cell = $('<td>');
                    $cell.text(arrData[i][j]);
                    $row.append($cell);
                }
            }

            // Append row even if empty, anyway
            $tbl.append($row);
        }

    } else {
        throw 'Invalid 2D array: ' + arrData;
    }
    return $tbl
}

/**
 * calculate the interpolate Color by given numeric value
 * @see interpolateColor
 * @param {Object} startColor the start color for scale/gradient. It is an Object with prop: r,g,b
 * @param {Object} endColor  the end color for scale/gradient. It is an Object with prop: r,g,b
 * @param {number} value the value for calculation
 * @param {number} minVal  the minimum value of the cell's values
 * @param {number} maxVal  the maximum value of the cell's values
 * @returns {Object} Calculated Color - the Object with prop: r,g,b
 */
function interpolateColorForNumVal(startColor, endColor, value, minVal, maxVal) {
    // Test for color scale
    // Calcuation for Linear color scale, using the function - interpolateColor()
    // See:  https://graphicdesign.stackexchange.com/questions/100917/how-do-i-calculate-color-gradients
    if (value >= maxVal) {
        return endColor;
    }

    if (value <= minVal) {
        return startColor;
    }

    var factor = (value - minVal) / (maxVal - minVal);   // change the scale from 0 to 1
    return interpolateColor(startColor, endColor, factor);
}

/**
 * Set the cell's background color by the given table.  The background color is calculated against the cell value.
 * @param {JQuery} $targetTbl the given table
 * @param {Object} startColor the start color for scale/gradient. It is an Object with prop: r,g,b
 * @param {Object} endColor  the end color for scale/gradient. It is an Object with prop: r,g,b
 * @param {number} minVal  the minimum value of the cell's values
 * @param {number} maxVal  the maximum value of the cell's values
 */
function setColorScaleBgToTbl($targetTbl, startColor, endColor, minVal, maxVal) {
    if ($targetTbl) {
        $targetTbl.find('td').each(function () {
            var $cell = $(this);
            var val = Number($cell.text());
            var valColor = interpolateColorForNumVal(startColor, endColor, val, minVal, maxVal);
            var valColorHex = rgbToHex(valColor.r, valColor.g, valColor.b);
            $cell.css('background-color', valColorHex);
        })
    }
}

// The main program will be started here when the document is loaded and ready
$(document).ready(function () {
    // Start from here
    var $output = $('#output');
    var startColor = hexToRgb(COLOR_SCALE_START);
    var endColor = hexToRgb(COLOR_SCALE_END);

    try {
        // Create the Random Table
        var $rndTbl = conv2DArrtoTable(create2dArrRandInt(TBL_WIDTH, TBL_HEIGHT, RAND_FROM, RAND_TO));
        $output.append('<h2>Random Integers - ' + TBL_WIDTH + ' x ' + TBL_HEIGHT + '</h2>');
        $output.append($rndTbl);

        setColorScaleBgToTbl($rndTbl, startColor, endColor, RAND_FROM, RAND_TO);


        var $mTbl = conv2DArrtoTable(create2dArrMultipleTable(TBL_WIDTH, TBL_HEIGHT));
        $output.append('<h2>Multiple Table - ' + TBL_WIDTH + ' x ' + TBL_HEIGHT + '</h2>');
        $output.append($mTbl);

        setColorScaleBgToTbl($mTbl, startColor, endColor, 1, 100);

    } catch (err) {
        console.log(err);
    }
});



/**
 * A dot matrix display.
 *
 * @author Björn Hempel <bjoern@hempel.li>
 * @param {number} width The width of the display.
 * @param {number} height The height of the display.
 * @constructor
 */
exports.builder = function (width, height) {
    this.widthDigit  = 2;
    this.heightDigit = 4;
    this.width       = width;
    this.height      = height;
    this.widthPanel  = Math.ceil(this.width / this.widthDigit);
    this.heightPanel = Math.ceil(this.height / this.heightDigit);
    this.width       = this.widthPanel * this.widthDigit;
    this.height      = this.heightPanel * this.heightDigit;
    this.dots        = {};
    this.panel       = {};
}

/**
 * Enables or disables a dot.
 *
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {Boolean} enable Enables the dot if true, disable it if false.
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.setDot = function (x, y, enable, skipRebuild) {
    var enable      = enable      ? true : false;
    var skipRebuild = skipRebuild ? true : false;

    var x = x;
    var y = this.height - y - 1;
    
    if (enable) {
        this.dots[x] = this.dots[x] ? this.dots[x] : {};
        this.dots[x][y] = true;
    } else {
        if (this.dots[x] && this.dots[x][y]) {
            delete this.dots[x][y];
        }
    }

    if (!skipRebuild) {
        var character = Math.floor(x / this.widthDigit);
        var line      = Math.floor(y / this.heightDigit);

        this.panel[line][character] = this.getDigit(character, line);
    }

    return true;
}

/**
 * Enables a dot.
 *
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.enableDot = function (x, y, skipRebuild) {
    return this.setDot(x, y, true, skipRebuild);
}

/**
 * Disables a dot.
 *
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.disableDot = function (x, y, skipRebuild) {
    return this.setDot(x, y, false, skipRebuild);
}

/**
 * Sets a set of dots at once including a panel reset.
 *
 * @param {Object} dots A set of points.
 * @param {Boolean} enable Enables all given dots if true, disable them if false.
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.setDots = function (dots, enable, skipRebuild) {
    this.resetPanel();
    this.addDots(dots, enable, skipRebuild);
    return true;
}

/**
 * Adds a set of dots at once without doing a panel reset.
 *
 * @param {Object} dots A set of points.
 * @param {Boolean} enable Enables all given dots if true, disable them if false.
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.addDots = function (dots, enable, skipRebuild) {
    for (var x in dots) {
        for (var y in dots[x]) {
            this.setDot(x, y, enable, true);
        }
    }

    if (!skipRebuild) {
        this.rebuildPanel();
    }

    return true;
}

/**
 * Enables all dots.
 *  
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */ 
exports.builder.prototype.enableAllDots = function (skipRebuild) {
    for (var x = 0; x < this.width; x++) {
        this.dots[x] = {};

        for (var y = 0; y < this.height; y++) {
            this.dots[x][y] = true;
        }
    }

    this.rebuildPanel();
}

/**
 * Build a dot set with a given callback function.
 *  
 * @param {function(number): number} callback The callback function.
 * @param {Object} An option object.
 * @return {Boolean} Returns the calculated dot set.
 */
exports.builder.prototype.getDotsByCallback = function (callback, options) {
    var dots    = {};
    var options = options ? options : {};

    /* set option defaults */
    options['fill-below'] = options['fill-below'] ? true : false;
    options['fill-above'] = options['fill-above'] ? true : false;

    for (var x = 0; x < this.width; x++) {
        var y = Math.round(callback(x));

        if (y >= 0 && y <= this.height) {
            dots[x] = dots[x] ? dots[x] : {};

            switch (true) {
                case options['fill-below']:
                    for (var yy = 0; yy <= y; yy++) {
                        dots[x][yy] = true;
                    }
                    break;

                case options['fill-above']:
                    for (var yy = y; yy <= this.height; yy++) {
                        dots[x][yy] = true;
                    }
                    break;

                default:
                    dots[x][y] = true;
                    break;
            }
        }
    }

    return dots;
}

/**
 * Sets a set of dots according the given fallback function at once including a panel reset.
 *
 * @param {function(number): number} callback The callback function.
 * @param {Boolean} enable Enables all given dots if true, disable them if false.
 * @param {Object} An option object.
 * @param {Boolean} skipRebuild Skip panel update if true.
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.setDotsByCallback = function (callback, enable, options, skipRebuild) {
    return this.setDots(this.getDotsByCallback(callback, options), enable, skipRebuild);
}

/**
 * Resets all dots and the panel.
 *
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.resetPanel = function () {
    this.dots  = {};
    this.panel = [];

    for (var line = 0; line < this.heightPanel; line++) {
        this.panel[line] = [];

        for (var character = 0; character < this.widthPanel; character++) {
            this.panel[line][character] = String.fromCharCode(10240);
        }
    }

    return true;
}

/**
 * Rebuild the panel according the saved dots (this.dots).
 *
 * @return {Boolean} Returns always true.
 */
exports.builder.prototype.rebuildPanel = function ()
{
    for (var line = 0; line < this.heightPanel; line++) {
        this.panel[line] = [];

        for (var character = 0; character < this.widthPanel; character++) {
             this.panel[line][character] = this.getDigit(character, line);
        }
    }

    return true;
}

/**
 * Gets the matrix digit (2x4) which is represented by one character.
 *
 * @param {number} xPanel The current x position in the dot matrix display.
 * @param {number} yPanel The current y position in the dot matrix display.
 * @return {string} Returns one char, that represents the current digit (2x4).
 */
exports.builder.prototype.getDigit = function (xPanel, yPanel) {
    var xPanel = xPanel ? parseInt(xPanel) : 0;
    var yPanel = yPanel ? parseInt(yPanel) : 0;
    var widthDigit  = 2;
    var heightDigit = 4;
    var bin2coord = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [0, 3], [1, 3]];
    var bin   = '';
    var start = 10240;

    for (var pos in bin2coord) {
        var coord = bin2coord[bin2coord.length - pos - 1];
        var x = coord[0] + xPanel * widthDigit;
        var y = coord[1] + yPanel * heightDigit;
        bin += this.dots[x] && this.dots[x][y] ? '1' : '0';
    }

    var digit = parseInt(bin, 2);

    return String.fromCharCode(start + digit);
}

/**
 * Returns the ready rendered display (panel).
 *
 * @return {string} The display string ready to print out.
 */
exports.builder.prototype.getPanel = function () {
    var panel = '';

    for (var line in this.panel) {
        panel += panel ? '\n' : '';

        for (var character in this.panel[line]) {
            panel += this.panel[line][character];
        }
    }

    return panel;
}



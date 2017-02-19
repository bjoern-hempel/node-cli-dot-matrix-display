# cli-dot-matrix-display

> A library to create a command line dot matrix display.


## Install

```
$ npm install cli-dot-matrix-display
```


## Usage

```js
var cliDotMatrixDisplay = require('cli-dot-matrix-display');

var width   = 128;
var height  = 32;
var display = new cliDotMatrixDisplay.builder(width, height);

/* print some custom dots */
var dots = {
    0: {
        0: true
    },
    1: {
        1: true
    },
    2: {
        2: true
    },
    3: {
        3: true
    }
};
console.log('――――――――――');
display.setDots(dots, true);
console.log(display.getPanel());
console.log('――――――――――');

/* print all dots */
console.log('――――――――――');
display.enableAllDots();
console.log(display.getPanel());
console.log('――――――――――');

/* print empty display */
console.log('――――――――――');
display.resetPanel();
console.log(display.getPanel());
console.log('――――――――――');

/* print sinus curve */
console.log('――――――――――');
var heightHalf = Math.floor((height - 1) / 2);
display.setDotsByCallback(function (x) {
    return Math.sin(16 * x * Math.PI / 180) * heightHalf + heightHalf;
}, true, {'fill-below': true});
console.log(display.getPanel());
console.log('――――――――――');

/* print increasing line */
console.log('――――――――――');
display.setDotsByCallback(function (x) {
    return x / 4;
}, true, {'fill-above': true});
console.log(display.getPanel());
console.log('――――――――――');

console.log('');
```

![cli-dot-matrix-display!](https://www.ixno.de/images/cli-dot-matrix-display.png)

## License

ISC © [Björn Hempel](https://www.ixno.de)

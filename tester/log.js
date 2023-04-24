const curPos = require('get-cursor-position'),
  readline = require('readline');

var _logInlineOld = function(row, msg) {
  //if(row >= 0) row --; //litle correction
  process.stdout.cursorTo(0, row);
  process.stdout.clearLine();
  process.stdout.cursorTo(0, row);
  process.stdout.write(msg.toString());
  //process.stdout.write('\n');
};
var _logInline = function(x,y, msg) {

  readline.cursorTo(process.stdout, x,y);
  readline.clearLine();
  readline.cursorTo(process.stdout, x,y);
  process.stdout.write(msg.toString());

};

var delay = 1000;
var time = 0;
//console.log('tst')
//console.log('dfdfdfd')
//Start by getting the current position
curPos.async(function(pos) {
  setInterval(function() {
      time++;
      //console.log(`${pos.row}-${pos.col}`)
      _logInline(pos.row,pos.col, 'alpha-' + time);
      _logInline(pos.row+1,pos.col, 'bravo-' + time * time);
  }, delay);
});

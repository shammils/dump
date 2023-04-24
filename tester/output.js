const c = require('chalk'),
  size = require('window-size'),
  readline = require('readline'),
  curPos = require('get-cursor-position');
const reprint = (...args) => {
  //readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  readline.clearScreenDown(process.stdout);
  process.stdout.write(args.join(' ')+"\033[0G");
};
const print = (pos, rows) => {
  for(let i=0;i<rows.length;i++) {
    if(pos >= 0) pos--; //litle correction
    process.stdout.cursorTo(0, pos);
    process.stdout.clearLine();
    process.stdout.cursorTo(0, pos);
    process.stdout.write(rows[i]);
    pos++;
  }
};
if (process.argv.length === 3) {
  switch(process.argv[2]) {
    case "0":
      console.log(`width: ${size.width}, height: ${size.height}`)
      break;
    case "1":
      //outputTest1();
      test1();
      break;
    case "2":
      test2();
      break;
    case "3":
      stdout2();
      break;
  }
} else {
  console.log(`specify numerical argument faggot`)
}
function test1() {
  // write a line and clear a line infinitely
  var line = "some test"
  var i=0;
  curPos.async(function(pos) {
    setInterval(()=>{
      if ((i%2)===0) {
        process.stdout.write('I am writing a line to the console')
      } else {
        readline.cursorTo(process.stdout, pos.row, pos.col);
        readline.clearScreenDown(process.stdout);
      }
      i++;
    }, 1000);
  });
}

function test2() {
  var pdfTitle = "Arabic for Dummies";
  var chapterTitle = "You Already Know a Little Arabic";//32
  var secondaryTitle = "Getting Started";//15
  var sectionTitle = "Arabic Origins of English Words";//31
  var rowsToDisplay = 3;
  var displayedRows = 0;
  var rows = [
    "|         admiral         |      amir al-baHr       |     Ruler of the Sea     |",
    "|         alcohol         |        al-kuHul         |   a mixture of powdered  |",
    "|                         |                         |         antimony         |",
    "|         alcove          |        al-qubba         |      a dome or arch      |",
    "|         algebra         |        al-jabr          | to reduce or consolidate |",
    "|         almanac         |       al-manakh         |         a calendar       |",
    "|         arsenal         |     daar As-SinaaH      |   house of manufacture   |",
    "|          azure          |        al-azward        |       lapis lazuli       |",
    "|          candy          |          qand           |        cane sugar        |",
    "|         coffee          |          qahwa          |          coffee          |",
    "|         cotton          |          quTon          |          cotton          |",
    "|         elixer          |        al-iksiir        |    phiosopher's stone    |"
  ];
  var plate = '================================================================================';
  var header = `|         English         |      Arabic Origin      |      Arabic Meaning      |`;
  var pos = curPos.sync();
  display(0);
  function display(index) {
    if (index < rows.length) {
      console.log(`    ${c.green(chapterTitle)}                  ${secondaryTitle}\n`);
      console.log(`${plate}\n${header}\n${plate}\n`);
      console.log(rows[index]);
      for (let i=1;i<rowsToDisplay;i++) if (rows[index+i]) console.log(rows[index+i]);
      setTimeout(() => {
        readline.cursorTo(process.stdout, pos.row, pos.col);
        readline.clearScreenDown(process.stdout);
        display(index+1);
      },1500);
    } else {
      console.log('done')
    }
  }
}
function stdout() {
  var rows = [
    "|         admiral         |      amir al-baHr       |     Ruler of the Sea     |",
    "|         alcohol         |        al-kuHul         |   a mixture of powdered  |",
    "|                         |                         |         antimony         |",
    "|         alcove          |        al-qubba         |      a dome or arch      |",
    "|         algebra         |        al-jabr          | to reduce or consolidate |",
    "|         almanac         |       al-manakh         |         a calendar       |",
    "|         arsenal         |     daar As-SinaaH      |   house of manufacture   |",
    "|          azure          |        al-azward        |       lapis lazuli       |",
    "|          candy          |          qand           |        cane sugar        |",
    "|         coffee          |          qahwa          |          coffee          |",
    "|         cotton          |          quTon          |          cotton          |",
    "|         elixer          |        al-iksiir        |    phiosopher's stone    |"
  ];
  display(0);
  function display(i) {
    if (i < rows.length) {
      setTimeout(()=>{
        process.stdout.write(rows[i]+"\033[0G");
        display(i+1);
      },1500);
    }
  }
}
function outputTest1() {
  var pdfTitle = "Arabic for Dummies";
  var chapterTitle = "You Already Know a Little Arabic";//32
  var secondaryTitle = "Getting Started";//15
  var sectionTitle = "Arabic Origins of English Words";//31
  var rowsToDisplay = 3;
  var displayedRows = 0;
  var rows = [
    "|         admiral         |      amir al-baHr       |     Ruler of the Sea     |",
    "|         alcohol         |        al-kuHul         |   a mixture of powdered  |",
    "|                         |                         |         antimony         |",
    "|         alcove          |        al-qubba         |      a dome or arch      |",
    "|         algebra         |        al-jabr          | to reduce or consolidate |",
    "|         almanac         |       al-manakh         |         a calendar       |",
    "|         arsenal         |     daar As-SinaaH      |   house of manufacture   |",
    "|          azure          |        al-azward        |       lapis lazuli       |",
    "|          candy          |          qand           |        cane sugar        |",
    "|         coffee          |          qahwa          |          coffee          |",
    "|         cotton          |          quTon          |          cotton          |",
    "|         elixer          |        al-iksiir        |    phiosopher's stone    |"
  ];
  // --------------------------------------------------------------------------------
  // |          alcohol        |         al-kuHul         |  a mixture of powdered  |
  // above is 80 char width, 25 first two, 26 last one
  var plate = '================================================================================';
  var header = `|         English         |      Arabic Origin      |      Arabic Meaning      |`;

  // lets see how to do this, not sure
  display(0);
  function display(index) {
    if (index < rows.length) {
      setTimeout(() => {
        var out = [];
        var thing = "\033[0G";
        out.push(`    ${c.green(chapterTitle)}                  ${secondaryTitle}\n`);
        out.push(`${plate}\n${header}\n${plate}\n`);
        out.push(rows[index]);
        //if (rows[index+1]) rows[index+1]+'\n';
        //if (rows[index+2]) rows[index+2]+'\n';
        //reprint(out);
        curPos.async(function(pos) {
            print(pos.row, out);
            display(index+1);
        });
        //process.stdout.write(rows[index]+"\033[0G");

      },1500);
    } else {
      console.log('done')
    }
  }
}

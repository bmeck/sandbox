var Sandbox = require("../lib/sandbox")
  , s = new Sandbox()

function resultPrinter( i ) {
  return function ( error, output ) {
    console.log( "Example " + i +
      "\nError: \n" + error + "\nResult: \n" + (output && output.result) + "\n---\n")
  }
}

// Example 1 - Standard JS
s.run( "console.log(1);", resultPrinter(1) )
/*
// Example 2 - Something slightly more complex
s.run( "(function(name) { return 'Hi there, ' + name + '!'; })('Fabio')", resultPrinter(2) )

// Example 3 - Syntax error
s.run( "lol)hai", resultPrinter(3) );

// Example 4 - Restricted code
s.run( "process.platform", resultPrinter(4) )

// Example 5 - Infinite loop
s.run( "while (true) {}", resultPrinter(5) )

// Example 6 - Caller Attack Failure
s.run( "(function foo() {return foo.caller.caller;})()", resultPrinter(6) )

// Example 7 - Argument Attack Failure
s.run( "(function foo() {return [].slice.call(foo.caller.arguments);})()", resultPrinter(7) )

// Example 8 - Type Coersion Attack Failure
s.run( "(function foo() {return {toJSON:function x(){return x.caller.caller.name}}})()", resultPrinter(8) )

// Example 9 - Global Attack Failure
s.run( "x=1;(function() {return this})().console.log.constructor('return this')()", resultPrinter(9) )

// Example 10 - Memory limit
new Sandbox( { timeout: 120 * 1000, memory: 1024 * 5 } ).run( "x=[];for(;;)x.push({});", resultPrinter(10) )
 */

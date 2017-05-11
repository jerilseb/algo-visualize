// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

function Node(val) {
    this.value = val;
    this.next = null;
}

function MyAlgorithm(am, w, h) {
    this.init(am, w, h);
}

MyAlgorithm.prototype = new Algorithm();
MyAlgorithm.prototype.constructor = MyAlgorithm;
MyAlgorithm.superclass = Algorithm.prototype;

MyAlgorithm.prototype.init = function(am, w, h) {
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    MyAlgorithm.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;
    this.commands = [];

    this.cmd("CreateLabel", 0, "", 500, 360, 0);
    this.nextIndex = 1;
    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();

    this.list = null;
    this.setUp();

    // TODO:  Add any code necessary to set up your own algorithm.  Initialize data
    // structures, etc.
};

MyAlgorithm.prototype.addControls = function() {
    this.controls = [];

    // Add any necessary controls for your algorithm.
    //   There are libraries that help with text entry, buttons, check boxes, radio groups
    //
    // To add a button myButton:
    this.mybutton = addControlToAlgorithmBar("Button", "Push");
    this.mybutton.onclick = this.insertCallback.bind(this);
    this.controls.push(this.mybutton);

    this.mybutton2 = addControlToAlgorithmBar("Button", "Pop");
    this.mybutton2.onclick = this.deleteCallback.bind(this);
    this.controls.push(this.mybutton2);

    //   where myCallback is a method on this function that implemnts the callback
    //
    // To add a text field myField:
    this.findField = addControlToAlgorithmBar("Text", "");
    this.findField.onkeydown = this.returnSubmit(this.findField, this.findCallback.bind(this), 2);
    this.findButton = addControlToAlgorithmBar("Button", "Find");
    this.findButton.onclick = this.findCallback.bind(this);

    this.controls.push(this.findField);
    this.controls.push(this.findButton);
    //
    // To add a textbox:
    //   	this.myCheckbox = addCheckboxToAlgorithmBar("Checkbox Label");
    //      this.myCheckbox.onclick = this.checkboxCallback.bind(this);
    //      this.controls.push(myCheckbox);
    //
    // To add a radio button group:
    //	  this.radioButtonList = addRadioButtonGroupToAlgorithmBar(["radio button label 1",
    //                                                              "radio button label 2",
    //                                                              "radio button label 3"],
    //                                                             "MyButtonGroupName");
    //    this.radioButtonList[0].onclick = this.firstRadioButtonCallback.bind(this);
    //    this.controls.push(this.radioButtonList[0]);
    //    this.radioButtonList[1].onclick = this.secondRadioButtonCallback.bind(this);
    //    this.controls.push(this.radioButtonList[1]);
    //    this.radioButtonList[2].onclick = this.thirdRadioButtonCallback.bind(this);
    //    this.controls.push(this.radioButtonList[1]);
    //
    // Note that we are adding the controls to the controls array so that they can be enabled / disabled
    // by the animation manager (see enableUI / disableUI below)
};

MyAlgorithm.prototype.reset = function() {
    // Reset all of your data structures to *exactly* the state they have immediately after the init
    // function is called.  This method is called whenever an "undo" is performed.  Your data
    // structures are completely cleaned, and then all of the actions *up to but not including* the
    // last action are then redone.  If you implement all of your actions through the "implementAction"
    // method below, then all of this work is done for you in the Animation "superclass"

    // Reset the (very simple) memory manager
    this.nextIndex = 1;
};

//////////////////////////////////////////////
// Callbacks:
//////////////////////////////////////////////
//
//   All of your callbacks should *not* do any work directly, but instead should go through the
//   implement action command.  That way, undos are handled by ths system "behind the scenes"
//
//   A typical example:
//
MyAlgorithm.prototype.insertCallback = function(event) {
    // Get value to insert from textfield (created in addControls above)

    // If you want numbers to all have leading zeroes, you can add them like this:
    var randomValue = Math.floor(Math.random() * 1000);
    randomValue = this.normalizeNumber(randomValue, 2);

    // Only do insertion if the text field is not empty ...
    // Do the actual work.  The function implementAction is defined in the algorithm superclass
    this.implementAction(this.Insert.bind(this), randomValue);
};

MyAlgorithm.prototype.deleteCallback = function(event) {
    // Get value to insert from textfield (created in addControls above)

    // Only do insertion if the text field is not empty ...
    // Do the actual work.  The function implementAction is defined in the algorithm superclass
    this.implementAction(this.Delete.bind(this));
};

MyAlgorithm.prototype.findCallback = function(event) {
    var findValue;
    findValue = this.normalizeNumber(this.findField.value, 2);
    this.findField.value = "";
    this.implementAction(this.findElement.bind(this), findValue);
};
//  Note that implementAction takes as parameters a function and an argument, and then calls that
//  function using that argument (while also storing the function/argument pair for future undos)

//////////////////////////////////////////////
// Doing actual work
//////////////////////////////////////////////
//   The functions that are called by implementAction (like insertElement in the comments above) need to:
//
//      1. Create an array of strings that represent commands to give to the animation manager
//      2. Return this array of commands
//
//    We strongly recommend that you use the this.cmd function, which is a handy utility function that
//    appends commands onto the instance variable this.commands
//
//    A simple example:
//

MyAlgorithm.prototype.setUp = function() {
    this.commands = []; // Empty out our commands variable, so it isn't corrupted by previous actions

    this.headID = this.nextIndex++;
    this.headLabelID = this.nextIndex++;

    this.cmd("CreateLabel", this.headLabelID, "Head", 900, 150);
    this.cmd("CreateRectangle", this.headID, "", 40, 30, 900, 180, "center", "center", "#eee");
    this.cmd("SetNull", this.headID, 1);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
};

MyAlgorithm.prototype.Insert = function(input) {
    this.commands = []; // Empty out our commands variable, so it isn't corrupted by previous actions

    // Get a new memory ID for the circle that we are going to create
    var circleID = this.nextIndex++;
    var circleX = 50;
    var circleY = 30;
    this.color = this.color || getRandomColor();

    // Create a circle
    this.cmd("CREATELINKEDLIST", circleID, input, circleX, circleY, 100, 100, 0.2, 0, 1, 1);
    this.cmd("SetNull", circleID, 1);
    this.cmd("SetBackgroundColor", circleID, this.color);

    var node = new Node(input);
    if (this.list == null) {
        this.list = node;
    } else {
        node.next = this.list;
        this.list = node;
    }

    node.id = circleID;
    node.x = node.next ? node.next.x - 70 : 900;
    node.y = 250;

    // Move the circle again
    this.cmd("Move", node.id, node.x, node.y);
    this.cmd("Step");
    // Next Animation step done
    if (node.next) {
        this.cmd("Connect", node.id, node.next.id);
        this.cmd("SetNull", node.id, 0);
        this.cmd("Disconnect", this.headID, node.next.id);
        this.cmd("Move", this.headID, node.x, 180);
        this.cmd("Move", this.headLabelID, node.x, 150);
    }
    this.cmd("Step");
    this.cmd("SetNull", this.headID, 0);
    this.cmd("Connect", this.headID, node.id);

    // Return the commands that were generated by the "cmd" calls:
    return this.commands;
};

MyAlgorithm.prototype.Delete = function() {
    this.commands = []; // Empty out our commands variable, so it isn't corrupted by previous actions
    var prev = null;
    this.cmd("Disconnect", this.headID, this.list.id);

    if (this.list.next != null) {
        prev = this.list;
        this.list = this.list.next;
        var node = this.list;

        this.cmd("Connect", this.headID, node.id, "#333");
        this.cmd("Disconnect", prev.id, node.id);
        this.cmd("Move", this.headID, node.x, 180);
        this.cmd("Move", this.headLabelID, node.x, 150);
        this.cmd("Step");
    } else if (this.list) {
        prev = this.list;
        this.list = null;
        this.cmd("SetNull", this.headID, 1);
        this.cmd("Step");
    } else return this.commands;

    this.cmd("Move", prev.id, 300, 900);
    this.cmd("Step");

    this.cmd("Delete", prev.id);

    // Return the commands that were generated by the "cmd" calls:
    return this.commands;
};

MyAlgorithm.prototype.findElement = function(findValue) {
    this.commands = [];

    this.highlightID = this.nextIndex++;
    var node = this.list;

    //this.doFind(this.treeRoot, findValue);
    this.cmd("SetText", 0, "Searching for " + findValue);
    while (node) {
        this.cmd("SetHighlight", node.id, 1);
        this.cmd("Step");

        if (node.value == findValue) {
            this.cmd("SetText", 0, "Found " + findValue);
            this.cmd("Step");
            this.cmd("Step");
            this.cmd("SetHighlight", node.id, 0);
            break;
        } else {
            this.cmd("SetHighlight", node.id, 0);
            node = node.next;
        }
    }
    if (!node) this.cmd("SetText", 0, findValue + " not found");
    return this.commands;
};

// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
MyAlgorithm.prototype.disableUI = function(event) {
    for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].disabled = true;
    }
};

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
MyAlgorithm.prototype.enableUI = function(event) {
    for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].disabled = false;
    }
};

var currentAlg;

function init() {
    var animManag = initCanvas();
    currentAlg = new MyAlgorithm(animManag, canvas.width, canvas.height);
}

function getRandomColor() {
    var letters = "ABDF".split("");
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

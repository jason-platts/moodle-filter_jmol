// coreconsole.z.js
// BH 1/5/2013 12:45:19 PM

Jmol.Console = {
	buttons:{},
	buttonWidth:100,
	click:function(id) {
		Jmol.Console.buttons[id].console.appletConsole.doAction(Jmol.Console.buttons[id]);
	}	
}

Jmol.Console.JSConsole = function(appletConsole) {
	this.applet = appletConsole.viewer.applet;
	var id = this.id = this.applet._id+"_console";
	var console = this;
	Jmol.Console.buttons[console.id] = console;
	console.appletConsole = appletConsole;
	console.input = appletConsole.input = new Jmol.Console.Input(console);
	console.output = appletConsole.output = new Jmol.Console.Output(console);

	// set up this.appletConsole.input, this.appletconsole.output
	// set up buttons, which are already made by this time: 	
  
  // I would prefer NOT to use jQueryUI for this - just simple buttons with simple actions

	// create and insert HTML code here

	var s = '<div id="$ID" class="jmolConsole" style="display:block;background-color:yellow;width:600px;height:330px;position:absolute;z-order:9999"><div id=$ID_title></id><div id=$ID_label1></div><div id=$ID_outputdiv></div><div id=$ID_inputdiv></div><div id=$ID_buttondiv></div></div>'

	var setBtn = function(console, btn) {
		btn.console = console;
		btn.id = id + "_" + btn.label.replace(/\s/g,"_");
		Jmol.Console.buttons[btn.id] = btn;
		return btn.html();
	}
	s = s.replace(/\$ID/g,id)
	$("body").after(s);
	
	console.setContainer($('#' + id));
	console.setPosition();
	console.dragBind(true);
	s = "&nbsp;&nbsp;&nbsp;&nbsp;<a href=\"javascript:Jmol.Console.buttons['"+id+"'].setVisible(false)\">close</a>";
	$("#" + id + "_label1").html(s);
	$("#" + id + "_inputdiv").html('<textarea id="' + id + '_input" style="width:590px;height:100px"></textarea>');
	$("#" + id + "_outputdiv").html('<textarea id="' + id + '_output" style="width:590px;height:200px"></textarea>');
	
	s = setBtn(console, appletConsole.runButton)
		+ setBtn(console, appletConsole.loadButton)
		+ setBtn(console, appletConsole.clearInButton)
		+ setBtn(console, appletConsole.clearOutButton)
		+ setBtn(console, appletConsole.historyButton)
		+ setBtn(console, appletConsole.stateButton);
	$("#" + id + "_buttondiv").html(s);
	$("#" + id + "_input").bind("keypress", function(event) { console.input.keyPressed(event) });
	$("#" + id + "_input").bind("keyup", function(event) { console.input.keyReleased(event) });
	$("#" + id + "_input").bind("mousedown touchstart", function(event) { console.ignoreMouse=true });
	$("#" + id + "_output").bind("mousedown touchstart", function(event) { console.ignoreMouse=true });

	console.setButton = function(text) {
		return new Jmol.Console.Button(this, text);
	}  

	console.setVisible = function(b) {	
		if (b)
			this.container.show();
		else
			this.container.hide();
		this.dragBind(b);
	}
	
	console.setTitle = function(title) {
		$("#" + this.id + "_title").html(title);
	}
}

Jmol._setDraggable(Jmol.Console.JSConsole);

Jmol.Console.Input = function(console) {

	this.console = console;
	
	// something like this....

	this.getText = function() {
		return $("#" + this.console.id + "_input").val();
	}

	this.setText = function(text) {
		if (text == null)
			text = "";
		$("#" + this.console.id + "_input").val(text);
	}

	this.keyPressed = function(ev) {
		var kcode = ev.which;
		var isCtrl = ev.ctrlKey;
    if (kcode == 13)kcode=10;
		var mode = this.console.appletConsole.processKey(kcode, 401/*java.awt.event.KeyEvent.KEY_PRESSED*/, isCtrl);
		
      if (isCtrl && kcode == 10)
        this.setText(this.getText() + "\n")

      if (ev.keyCode == 9 || kcode == 9) {
      // tab         
        var me = this;
        setTimeout(function(){me.setText(me.getText() + "\t"); $("#" + me.console.id + "_input").focus()},10);	
      }
        
    if ((mode & 1) == 1 || kcode == 0)
			ev.preventDefault();
		if ((mode & 2) == 2) {
		}
    
    
	}

	this.keyReleased = function(ev) {
		var kcode = ev.which;
		var isCtrl = ev.ctrlKey;
    if (kcode == 13)kcode=10;                                  
    if (kcode == 38 || kcode == 40) {
      this.keyPressed(ev);
			ev.preventDefault();
      return;
    }
		var mode = this.console.appletConsole.processKey(kcode, 402/*java.awt.event.KeyEvent.KEY_RELEASED*/, isCtrl);
		
    if ((mode & 1) == 1)
			ev.preventDefault();
		if ((mode & 2) == 2) {
		}
	}


  this.getCaretPosition = function() {
    var el = $(this).get(0);
    if('selectionStart' in el)
      return el.selectionStart;
		if(!('selection' in document))
			return 0;
    el.focus();
    var sel = document.selection.createRange();
    var len = document.selection.createRange().text.length;
    sel.moveStart('character', -el.value.length);
    return sel.text.length - len;
	}

}

Jmol.Console.Output = function(console) {
	this.console = console;
		
	this.getText = function() {
		return $("#" + this.console.id + "_output").val();
	}

	this.setText = function(text) {
		if (text == null)
			text = "";
		$("#" + this.console.id + "_output").val(text);
	}
	
  this.append = function(message, att) {
		this.setText(this.getText() + message); 		 
  }
}

Jmol.Console.Button = function(text) {
	this.label = text;
}

Jmol.Console.Button.prototype.addConsoleListener = function(appletConsole) {
	this.appletConsole = appletConsole;
	Jmol.Console.buttons[this.id] = this;
}
  
Jmol.Console.Button.prototype.html = function() {
	var s = '<input type="button" id="' + this.id + '" style="width:' + Jmol.Console.buttonWidth + 'px" value="' + this.label + '" onClick="Jmol.Console.click(\'' + this.id + '\')"/>'
	return s;
}

// 
//// J\api\JmolAppConsoleInterface.js 
// 
Clazz.declarePackage ("J.api");
Clazz.declareInterface (J.api, "JmolAppConsoleInterface");
// 
//// J\console\GenericTextArea.js 
// 
Clazz.declarePackage ("J.console");
Clazz.declareInterface (J.console, "GenericTextArea");
// 
//// J\console\GenericConsole.js 
// 
Clazz.declarePackage ("J.console");
Clazz.load (["J.api.JmolAppConsoleInterface", "$.JmolCallbackListener", "java.util.Hashtable"], "J.console.GenericConsole", ["java.lang.Boolean", "J.constant.EnumCallback", "J.i18n.GT", "J.script.T", "J.util.TextFormat", "J.viewer.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.input = null;
this.output = null;
this.viewer = null;
this.labels = null;
this.menuMap = null;
this.editButton = null;
this.runButton = null;
this.historyButton = null;
this.stateButton = null;
this.clearOutButton = null;
this.clearInButton = null;
this.loadButton = null;
this.defaultMessage = null;
this.label1 = null;
this.nTab = 0;
this.incompleteCmd = null;
Clazz.instantialize (this, arguments);
}, J.console, "GenericConsole", null, [J.api.JmolAppConsoleInterface, J.api.JmolCallbackListener]);
Clazz.prepareFields (c$, function () {
this.menuMap =  new java.util.Hashtable ();
});
$_M(c$, "setViewer", 
function (viewer) {
this.viewer = viewer;
}, "J.api.JmolViewer");
$_M(c$, "addButton", 
function (b, label) {
b.addConsoleListener (this);
this.menuMap.put (label, b);
return b;
}, "J.api.JmolAbstractButton,~S");
$_M(c$, "getLabel1", 
function () {
return null;
});
$_M(c$, "setupLabels", 
function () {
this.labels.put ("help", J.i18n.GT._ ("&Help"));
this.labels.put ("search", J.i18n.GT._ ("&Search..."));
this.labels.put ("commands", J.i18n.GT._ ("&Commands"));
this.labels.put ("functions", J.i18n.GT._ ("Math &Functions"));
this.labels.put ("parameters", J.i18n.GT._ ("Set &Parameters"));
this.labels.put ("more", J.i18n.GT._ ("&More"));
this.labels.put ("Editor", J.i18n.GT._ ("Editor"));
this.labels.put ("State", J.i18n.GT._ ("State"));
this.labels.put ("Run", J.i18n.GT._ ("Run"));
this.labels.put ("Clear Output", J.i18n.GT._ ("Clear Output"));
this.labels.put ("Clear Input", J.i18n.GT._ ("Clear Input"));
this.labels.put ("History", J.i18n.GT._ ("History"));
this.labels.put ("Load", J.i18n.GT._ ("Load"));
this.labels.put ("label1", J.i18n.GT._ ("press CTRL-ENTER for new line or paste model data and press Load"));
this.labels.put ("default", J.i18n.GT._ ("Messages will appear here. Enter commands in the box below. Click the console Help menu item for on-line help, which will appear in a new browser window."));
});
$_M(c$, "setLabels", 
function () {
var doTranslate = J.i18n.GT.setDoTranslate (true);
this.editButton = this.setButton ("Editor");
this.stateButton = this.setButton ("State");
this.runButton = this.setButton ("Run");
this.clearOutButton = this.setButton ("Clear Output");
this.clearInButton = this.setButton ("Clear Input");
this.historyButton = this.setButton ("History");
this.loadButton = this.setButton ("Load");
this.defaultMessage = this.getLabel ("default");
this.setTitle ();
J.i18n.GT.setDoTranslate (false);
{
this.defaultMessage = this.getLabel("default").split("Click")[0];
}J.i18n.GT.setDoTranslate (doTranslate);
this.defaultMessage = this.getLabel ("default");
});
$_M(c$, "getLabel", 
function (key) {
if (this.labels == null) {
this.labels =  new java.util.Hashtable ();
this.labels.put ("title", J.i18n.GT._ ("Jmol Script Console") + " " + J.viewer.Viewer.getJmolVersion ());
this.setupLabels ();
}return this.labels.get (key);
}, "~S");
$_M(c$, "displayConsole", 
function () {
this.layoutWindow (null);
this.outputMsg (this.defaultMessage);
});
$_M(c$, "updateLabels", 
function () {
return;
});
$_M(c$, "completeCommand", 
function (thisCmd) {
if (thisCmd.length == 0) return null;
var strCommand = (this.nTab <= 0 || this.incompleteCmd == null ? thisCmd : this.incompleteCmd);
this.incompleteCmd = strCommand;
var splitCmd = J.console.GenericConsole.splitCommandLine (thisCmd);
if (splitCmd == null) return null;
var asCommand = splitCmd[2] == null;
var inBrace = (splitCmd[3] != null);
var notThis = splitCmd[asCommand ? 1 : 2];
var s = splitCmd[1];
if (notThis.length == 0) return null;
var token = J.script.T.getTokenFromName (s.trim ());
var cmdtok = (token == null ? 0 : token.tok);
var isSelect = J.script.T.tokAttr (cmdtok, 12288);
splitCmd = J.console.GenericConsole.splitCommandLine (strCommand);
var cmd = null;
if (!asCommand && (notThis.charAt (0) == '"' || notThis.charAt (0) == '\'')) {
var q = notThis.charAt (0);
notThis = J.util.TextFormat.trim (notThis, "\"\'");
var stub = J.util.TextFormat.trim (splitCmd[2], "\"\'");
cmd = this.nextFileName (stub, this.nTab);
if (cmd != null) cmd = splitCmd[0] + splitCmd[1] + q + cmd + q;
} else {
var map = null;
if (!asCommand) {
notThis = s;
if (inBrace || splitCmd[2].startsWith ("$") || J.script.T.isIDcmd (cmdtok) || isSelect) {
map =  new java.util.Hashtable ();
this.viewer.getObjectMap (map, inBrace || isSelect ? '{' : splitCmd[2].startsWith ("$") ? '$' : '0');
}}cmd = J.script.T.completeCommand (map, s.equalsIgnoreCase ("set "), asCommand, asCommand ? splitCmd[1] : splitCmd[2], this.nTab);
cmd = splitCmd[0] + (cmd == null ? notThis : asCommand ? cmd : splitCmd[1] + cmd);
}return (cmd == null || cmd.equals (strCommand) ? null : cmd);
}, "~S");
$_M(c$, "doAction", 
function (source) {
if (source === this.runButton) {
this.execute (null);
} else if (source === this.editButton) {
this.viewer.getProperty ("DATA_API", "scriptEditor", null);
} else if (source === this.historyButton) {
this.clearContent (this.viewer.getSetHistory (2147483647));
} else if (source === this.stateButton) {
this.clearContent (this.viewer.getStateInfo ());
} else if (source === this.clearInButton) {
this.input.setText ("");
return;
}if (source === this.clearOutButton) {
this.output.setText ("");
return;
}if (source === this.loadButton) {
this.viewer.loadInline (this.input.getText (), false);
return;
}if (this.isMenuItem (source)) {
this.execute ((source).getName ());
return;
}}, "~O");
$_M(c$, "execute", 
function (strCommand) {
var cmd = (strCommand == null ? this.input.getText () : strCommand);
if (strCommand == null) this.input.setText (null);
var strErrorMessage = this.viewer.script (cmd + "\u0001## EDITOR_IGNORE ##");
if (strErrorMessage != null && !strErrorMessage.equals ("pending")) this.outputMsg (strErrorMessage);
}, "~S");
$_M(c$, "destroyConsole", 
function () {
if (this.viewer.isApplet ()) this.viewer.getProperty ("DATA_API", "getAppConsole", Boolean.FALSE);
});
c$.setAbstractButtonLabels = $_M(c$, "setAbstractButtonLabels", 
function (menuMap, labels) {
var e = menuMap.keySet ().iterator ();
while (e.hasNext ()) {
var key = e.next ();
var m = menuMap.get (key);
var label = labels.get (key);
if (key.indexOf ("Tip") == key.length - 3) {
m.setToolTipText (labels.get (key));
} else {
var mnemonic = J.console.GenericConsole.getMnemonic (label);
if (mnemonic != ' ') m.setMnemonic (mnemonic);
label = J.console.GenericConsole.getLabelWithoutMnemonic (label);
m.setText (label);
}}
}, "java.util.Map,java.util.Map");
c$.getLabelWithoutMnemonic = $_M(c$, "getLabelWithoutMnemonic", 
function (label) {
if (label == null) {
return null;
}var index = label.indexOf ('&');
if (index == -1) {
return label;
}return label.substring (0, index) + ((index < label.length - 1) ? label.substring (index + 1) : "");
}, "~S");
c$.getMnemonic = $_M(c$, "getMnemonic", 
function (label) {
if (label == null) {
return ' ';
}var index = label.indexOf ('&');
if ((index == -1) || (index == label.length - 1)) {
return ' ';
}return label.charAt (index + 1);
}, "~S");
c$.map = $_M(c$, "map", 
function (button, key, label, menuMap) {
var mnemonic = J.console.GenericConsole.getMnemonic (label);
if (mnemonic != ' ') (button).setMnemonic (mnemonic);
menuMap.put (key, button);
}, "~O,~S,~S,java.util.Map");
Clazz.overrideMethod (c$, "notifyEnabled", 
function (type) {
switch (type) {
case J.constant.EnumCallback.ECHO:
case J.constant.EnumCallback.MEASURE:
case J.constant.EnumCallback.MESSAGE:
case J.constant.EnumCallback.PICK:
return true;
case J.constant.EnumCallback.ANIMFRAME:
case J.constant.EnumCallback.APPLETREADY:
case J.constant.EnumCallback.ATOMMOVED:
case J.constant.EnumCallback.CLICK:
case J.constant.EnumCallback.ERROR:
case J.constant.EnumCallback.EVAL:
case J.constant.EnumCallback.HOVER:
case J.constant.EnumCallback.LOADSTRUCT:
case J.constant.EnumCallback.MINIMIZATION:
case J.constant.EnumCallback.RESIZE:
case J.constant.EnumCallback.SCRIPT:
case J.constant.EnumCallback.SYNC:
break;
}
return false;
}, "J.constant.EnumCallback");
Clazz.overrideMethod (c$, "getText", 
function () {
return this.output.getText ();
});
Clazz.overrideMethod (c$, "sendConsoleEcho", 
function (strEcho) {
if (strEcho == null) {
this.updateLabels ();
this.outputMsg (null);
strEcho = this.defaultMessage;
}this.outputMsg (strEcho);
}, "~S");
$_M(c$, "outputMsg", 
($fz = function (message) {
if (message == null || message.length == 0) {
this.output.setText ("");
return;
}if (message.charAt (message.length - 1) != '\n') message += "\n";
this.output.append (message);
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "clearContent", 
function (text) {
this.output.setText (text);
}, "~S");
Clazz.overrideMethod (c$, "sendConsoleMessage", 
function (strInfo) {
if (strInfo != null && this.output.getText ().startsWith (this.defaultMessage)) this.outputMsg (null);
this.outputMsg (strInfo);
}, "~S");
Clazz.overrideMethod (c$, "notifyCallback", 
function (type, data) {
var strInfo = (data == null || data[1] == null ? null : data[1].toString ());
switch (type) {
case J.constant.EnumCallback.ECHO:
this.sendConsoleEcho (strInfo);
break;
case J.constant.EnumCallback.MEASURE:
var mystatus = data[3];
if (mystatus.indexOf ("Picked") >= 0 || mystatus.indexOf ("Sequence") >= 0) this.sendConsoleMessage (strInfo);
 else if (mystatus.indexOf ("Completed") >= 0) this.sendConsoleEcho (strInfo.substring (strInfo.lastIndexOf (",") + 2, strInfo.length - 1));
break;
case J.constant.EnumCallback.MESSAGE:
this.sendConsoleMessage (data == null ? null : strInfo);
break;
case J.constant.EnumCallback.PICK:
this.sendConsoleMessage (strInfo);
break;
}
}, "J.constant.EnumCallback,~A");
Clazz.overrideMethod (c$, "setCallbackFunction", 
function (callbackType, callbackFunction) {
}, "~S,~S");
Clazz.overrideMethod (c$, "zap", 
function () {
});
$_M(c$, "recallCommand", 
function (up) {
var cmd = this.viewer.getSetHistory (up ? -1 : 1);
if (cmd == null) return;
this.input.setText (cmd);
}, "~B");
$_M(c$, "processKey", 
function (kcode, kid, isControlDown) {
var mode = 0;
switch (kid) {
case 401:
switch (kcode) {
case 9:
mode = 1;
if (this.input.getCaretPosition () == this.input.getText ().length) {
var cmd = this.completeCommand (this.getText ());
if (cmd != null) this.input.setText (cmd.$replace ('\t', ' '));
this.nTab++;
return mode;
}break;
case 27:
mode = 1;
this.input.setText ("");
break;
}
this.nTab = 0;
if (kcode == 10 && !isControlDown) {
this.execute (null);
return mode;
}if (kcode == 38 || kcode == 40) {
this.recallCommand (kcode == 38);
return mode;
}break;
case 402:
if (kcode == 10 && !isControlDown) return mode;
break;
}
return mode | 2;
}, "~N,~N,~B");
c$.splitCommandLine = $_M(c$, "splitCommandLine", 
($fz = function (cmd) {
var sout =  new Array (4);
var isEscaped1 = false;
var isEscaped2 = false;
var isEscaped = false;
if (cmd.length == 0) return null;
var ptQ = -1;
var ptCmd = 0;
var ptToken = 0;
var nBrace = 0;
var ch;
for (var i = 0; i < cmd.length; i++) {
switch (ch = cmd.charAt (i)) {
case '"':
if (!isEscaped && !isEscaped1) {
isEscaped2 = !isEscaped2;
if (isEscaped2) ptQ = ptToken = i;
}break;
case '\'':
if (!isEscaped && !isEscaped2) {
isEscaped1 = !isEscaped1;
if (isEscaped1) ptQ = ptToken = i;
}break;
case '\\':
isEscaped = !isEscaped;
continue;
case ' ':
if (!isEscaped && !isEscaped1 && !isEscaped2) {
ptToken = i + 1;
ptQ = -1;
}break;
case ';':
if (!isEscaped1 && !isEscaped2) {
ptCmd = ptToken = i + 1;
ptQ = -1;
nBrace = 0;
}break;
case '{':
case '}':
if (!isEscaped1 && !isEscaped2) {
nBrace += (ch == '{' ? 1 : -1);
ptToken = i + 1;
ptQ = -1;
}break;
default:
if (!isEscaped1 && !isEscaped2) ptQ = -1;
}
isEscaped = false;
}
sout[0] = cmd.substring (0, ptCmd);
sout[1] = (ptToken == ptCmd ? cmd.substring (ptCmd) : cmd.substring (ptCmd, (ptToken > ptQ ? ptToken : ptQ)));
sout[2] = (ptToken == ptCmd ? null : cmd.substring (ptToken));
sout[3] = (nBrace > 0 ? "{" : null);
return sout;
}, $fz.isPrivate = true, $fz), "~S");
});
// 
//// J\consolejs\AppletConsole.js 
// 
Clazz.declarePackage ("J.consolejs");
Clazz.load (["J.console.GenericConsole"], "J.consolejs.AppletConsole", null, function () {
c$ = Clazz.decorateAsClass (function () {
this.jsConsole = null;
Clazz.instantialize (this, arguments);
}, J.consolejs, "AppletConsole", J.console.GenericConsole);
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, J.consolejs.AppletConsole, []);
});
Clazz.overrideMethod (c$, "start", 
function (viewer) {
this.setViewer (viewer);
this.setLabels ();
this.displayConsole ();
}, "J.api.JmolViewer");
Clazz.overrideMethod (c$, "layoutWindow", 
function (enabledButtons) {
{
this.jsConsole = new Jmol.Console.JSConsole(this);
}this.setTitle ();
}, "~S");
Clazz.overrideMethod (c$, "setTitle", 
function () {
{
if (this.jsConsole)
this.jsConsole.setTitle(this.getLabel("title"));
}});
Clazz.overrideMethod (c$, "setVisible", 
function (visible) {
{
this.jsConsole.setVisible(visible);
}}, "~B");
Clazz.overrideMethod (c$, "setButton", 
function (text) {
{
return new Jmol.Console.Button(text);
}}, "~S");
Clazz.overrideMethod (c$, "dispose", 
function () {
this.setVisible (false);
});
Clazz.overrideMethod (c$, "isMenuItem", 
function (source) {
return false;
}, "~O");
Clazz.overrideMethod (c$, "getScriptEditor", 
function () {
return null;
});
Clazz.overrideMethod (c$, "nextFileName", 
function (stub, nTab) {
return null;
}, "~S,~N");
});

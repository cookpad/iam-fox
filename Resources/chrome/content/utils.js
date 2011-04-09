function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++) {
      elements.push(document.getElementById(arguments[i]));
    }

    return elements;
  }

  return document.getElementById(element + '');
}

POLICY_ALLOW_ALL = '{\n  "Statement": [\n    {\n      "Effect":"Allow",\n      "Action":"*",\n      "Resource":"*"\n    }\n  ]\n}\n';

function protect(callback) {
  var retval = null;

  try {
    retval = callback();
  } catch (e) {
    if (e.xml) {
      openErrorDialog(e);
    } else {
      alert(e);
    }
  }

  return retval;
}

Function.prototype.bind = function(context) {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length;
    var length = args.length;

    while (length--) {
      array[arrayLength + length] = args[length];
    }

    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  if (arguments.length < 2 && typeof(arguments[0]) === "undefined") {
    return this;
  }

  var __method = this;
  var args = slice.call(arguments, 1);

  return function() {
    var a = merge(args, arguments);
    return __method.apply(context, a);
  };
}

function openErrorDialog(xhr) {
  openDialog('chrome://iamfox/content/error-dialog.xul', 'error-dialog', 'chrome,modal,width=400,height=300',
             {error:xhr.xml()..Error});
}

function openURL(url) {
  try {
    var io = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
    var uri = io.newURI(url, null, null);
    var eps = Components.classes['@mozilla.org/uriloader/external-protocol-service;1'].getService(Components.interfaces.nsIExternalProtocolService);
    var launcher = eps.getProtocolHandlerInfo('http');
    launcher.preferredAction = Components.interfaces.nsIHandlerInfo.useSystemDefault;
    launcher.launchWithURI(uri, null);
  } catch (e) {
    alert(e);
  }
}

function sortRowsByColumn(column, rows) {
  var colkey = column.id.toString().split('.');

  if (colkey.length < 1) {
    return false;
  }

  colkey = colkey[colkey.length - 1];

  var sortDirection = column.element.getAttribute('sortDirection');

  for (var i = 0; i < column.columns.count; i++) {
    column.columns.getColumnAt(i).element.setAttribute('sortDirection', 'natural');
  }

  rows.sort(function(a, b) {
    a = a[colkey];
    b = b[colkey];
    return (a < b) ? -1 : (a > b) ? 1 : 0;
  });

  if (sortDirection == 'ascending' || sortDirection == 'natural') {
    sortDirection = 'descending';
    rows.reverse();
  } else {
    sortDirection = 'ascending';
  }

  column.element.setAttribute('sortDirection', sortDirection);

  return true;
}

Array.prototype.uniq = function() {
  var hash = {}

  for (var i = 0; i < this.length; i++) {
    var value = this[i];
    hash[value] = value;
  }

  var array = [];

  for (var i in hash) {
    array.push(i);
  }

  return array;
};

function copyToClipboard(text) {
  var str = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
  var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
  var clip = Components.classes['@mozilla.org/widget/clipboard;1'].getService(Components.interfaces.nsIClipboard);

  if (str && trans && clip) {
    str.data = text;
    trans.addDataFlavor('text/unicode');
    trans.setTransferData('text/unicode', str, text.length * 2);
    clip.setData(trans, null, Components.interfaces.nsIClipboard.kGlobalClipboard);
  }
}

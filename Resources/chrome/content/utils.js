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
    openErrorDialog(e);
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

function protect(callback) {
  var retval = null;

  try {
    retval = callback();
  } catch (e) {
    alert(e);
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

POLICY_ALLOW_ALL = '{\n  "Statement": [\n    {\n      "Effect":"Allow",\n      "Action":"*",\n      "Resource":"*"\n    }\n  ]\n}\n';

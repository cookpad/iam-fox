function windowOnLoad() {
  var iamcli = newIAMClient();

  function bind(clazz, name) {
    var obj = new clazz(iamcli);
    var tab = document.getElementById(name + '-tab');
    tab.view = obj;
    var tree = document.getElementById(name + '-tree');
    tree.view = obj;
    tree._view = obj;
  }

  if (iamcli) {
    bind(GroupTreeView, 'group');
    bind(UserTreeView, 'user');
    selectedView().refresh();
  }
}

function tabOnSelect(event) {
  var view = selectedView();
  if (view) { view.refresh(); }
}

function selectedView() {
  var tab = document.getElementById('main-tabs').selectedItem;
  return tab ? tab.view : null;
}

function treeViews() {
  var views = [];
  var tabs = document.getElementById('main-tabs').getElementsByTagName('tab');

  for each (tab in tabs) {
    if (tab.view) {
      views.push(tab.view);
    }
  }

  return views;
}

function openAccountDialog() {
  openDialog('chrome://iamfox/content/account-dialog.xul', 'account-dialog', 'modeless',
             {prefs:Prefs, views:treeViews(), newIAMClient:newIAMClient});
}

function newIAMClient() {
  if (!Prefs.accessKeyId || !Prefs.secretAccessKey) {
    openAccountDialog();
  }

  if (!Prefs.accessKeyId || !Prefs.secretAccessKey) {
    alert("'AWS Access Key ID' or 'AWS Secret Access Key' was not input.");
    close();
    return null;
  } else {
    return new IAMClient(Prefs.accessKeyId, Prefs.secretAccessKey);
  }
}

function inProgress(callback) {
  var progressmeter = document.getElementById('main-progressmeter');
  var retval = null;
  var exception = null;

  progressmeter.mode = 'undetermined';
  progressmeter.value = 0;

  try {
    retval = callback();
  } catch (e) {
    exception = e;
  }

  progressmeter.mode = 'determined';
  progressmeter.value = 100;

  if (exception) {
    throw exception;
  }

  return retval;
}

function protect(callback) {
  try {
    callback();
  } catch (e) {
    alert(e);
  }
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

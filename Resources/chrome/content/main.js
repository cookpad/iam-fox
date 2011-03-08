function windowOnLoad() {
  var iamcli = newIAMClient();

  function bind(clazz, name) {
    var obj = new clazz(iamcli);
    document.getElementById(name + '-tab').view = obj;
    document.getElementById(name + '-tree').view = obj;
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

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].view) {
      views.push(tabs[i].view);
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

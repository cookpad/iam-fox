function exportKeysToJson() {
  var fp = newFilePicker();
  fp.init(window, 'Export keys', Components.interfaces.nsIFilePicker.modeSave);
  fp.defaultString = 'awskeys.json';
  fp.appendFilter('JSON (*.json)', '*.json');

  var result = fp.show();

  switch (result) {
  case Components.interfaces.nsIFilePicker.returnOK:
  case Components.interfaces.nsIFilePicker.returnReplace:
    exportKeys(fp.file);
    break;
  }
}

function exportKeys(fout) {
  var data = {
    userAccessKeyIds: Prefs.userAccessKeyIds,
    userSecretAccessKeys: Prefs.userSecretAccessKeys
  };

  var rv = FileIO.write(fout, data.toSource());

  return rv;
}

function importJsonToKeys() {
  var fp = newFilePicker();
  fp.init(window, 'Import and Merge keys', Components.interfaces.nsIFilePicker.modeOpen);
  fp.appendFilter('JSON (*.json)', '*.json');

  var result = fp.show();

  switch (result) {
  case Components.interfaces.nsIFilePicker.returnOK:
  case Components.interfaces.nsIFilePicker.returnReplace:
    importKeys(fp.file);
    break;
  }
}

function importKeys(fin) {
  var new_data = FileIO.read(fin);

  if (!new_data) {
    alert("Cannnot read file.");
    return false;
  }

  try {
    new_data = eval(new_data);
  } catch (e) {
    alert(e);
    return false;
  }

  var newUserAccessKeyIds = new_data.userAccessKeyIds;
  var newUserSecretAccessKeys = new_data.userSecretAccessKeys;

  Prefs.mergeUserAccessKeyIds(newUserAccessKeyIds);
  Prefs.mergeUserSecretAccessKeys(newUserSecretAccessKeys);

  return true;
}

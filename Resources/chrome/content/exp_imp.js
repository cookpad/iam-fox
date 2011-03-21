function openExportDialog() {
  openDialog('chrome://iamfox/content/export-dialog.xul', 'export-dialog', 'chrome,modal', {exportKeys:exportKeys});
}

function exportKeys(path) {
  var fout = FileIO.open(path);

  if (!fout) {
    return false;
  }

  var data = {
    userAccessKeyIds: Prefs.userAccessKeyIds,
    userSecretAccessKeys: Prefs.userSecretAccessKeys
  };

  var rv = FileIO.write(fout, data.toSource());

  return rv;
}


function openImportDialog() {
  openDialog('chrome://iamfox/content/import-dialog.xul', 'import-dialog', 'chrome,modal', {importKeys:importKeys});
}

function importKeys(path) {
  var fin = FileIO.open(path);

  if (!fin) {
    return false;
  }

  var new_data = FileIO.read(fin);

  if (!new_data) {
    return false;
  }

  new_data = eval(new_data);
  var newUserAccessKeyIds = new_data.userAccessKeyIds;
  var newUserSecretAccessKeys = new_data.userSecretAccessKeys;

  Prefs.mergeUserAccessKeyIds(newUserAccessKeyIds);
  Prefs.mergeUserSecretAccessKeys(newUserSecretAccessKeys);

  return true;
}

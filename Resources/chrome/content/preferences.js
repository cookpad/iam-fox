Prefs = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),

  get accessKeyId() {
    return nsPreferences.copyUnicharPref('iamfox.accessKeyId', '').trim();
  },

  set accessKeyId(v) {
    nsPreferences.setUnicharPref('iamfox.accessKeyId', v);
  },

  get secretAccessKey() {
    return nsPreferences.copyUnicharPref('iamfox.secretAccessKey', '').trim();
  },

  set secretAccessKey(v) {
    nsPreferences.setUnicharPref('iamfox.secretAccessKey', v);
  },

  getUserAccessKeyId: function(name) {
    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);
    return userAccessKeyIds[name];
  },

  setUserAccessKeyId: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);
    userAccessKeyIds[name] = key;
    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
  },

  getUserSecretAccessKey: function(name) {
    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    return userSecretAccessKeys[name];
  },

  setUserSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    userSecretAccessKeys[name] = key;
    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  },

  renameUserAccessKeyIdAndSecretAccessKey: function(old_name, new_name) {
    old_name = old_name.toString();
    new_name = new_name.toString();

    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);

    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);

    var accessKeyId = userAccessKeyIds[old_name];
    var secretAccessKeys = userSecretAccessKeys[old_name];
    userAccessKeyIds[new_name] = accessKeyId;
    userSecretAccessKeys[new_name] = secretAccessKeys;
    delete userAccessKeyIds[old_name];
    delete userSecretAccessKeys[old_name];

    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  },
};

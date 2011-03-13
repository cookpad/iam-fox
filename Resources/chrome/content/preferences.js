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
    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    userSecretAccessKeys[name] = key;
    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  }
};

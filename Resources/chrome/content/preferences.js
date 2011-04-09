Prefs = {
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
    var userAccessKeyId = (userAccessKeyIds[name] || []);

    if (typeof(userAccessKeyId) == "string") {
      userAccessKeyId = [userAccessKeyId];
    }

    return userAccessKeyId;
  },

  setUserAccessKeyId: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);
    userAccessKeyIds[name] = [key];
    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
  },

  addUserAccessKeyId: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);
    var userAccessKeyId = (userAccessKeyIds[name] || []);

    if (typeof(userAccessKeyId) == "string") {
      userAccessKeyId = [userAccessKeyId];
    }

    userAccessKeyId.push(key);
    userAccessKeyIds[name] = userAccessKeyId;

    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
  },

  deleteUserAccessKeyId: function(name) {
    name = name.toString();

    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);
    delete userAccessKeyIds[name];
    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
  },

  getUserSecretAccessKey: function(name) {
    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    var userSecretAccessKey = (userSecretAccessKeys[name] || []);

    if (typeof(userSecretAccessKey) == "string") {
      userSecretAccessKey = [userSecretAccessKey];
    }

    return userSecretAccessKey;
  },

  setUserSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    userSecretAccessKeys[name] = [key];
    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  },

  addUserSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    var userSecretAccessKey = (userSecretAccessKeys[name] || []);

    if (typeof(userSecretAccessKey) == "string") {
      userSecretAccessKey = [userSecretAccessKey];
    }

    userSecretAccessKey.push(key);
    userSecretAccessKeys[name] = userSecretAccessKey;

    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  },

  deleteUserSecretAccessKey: function(name) {
    name = name.toString();

    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);
    delete userSecretAccessKeys[name];
    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  },

  deleteUserAccessKeyIdAndSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);

    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);

    for (var i = 0; i < userAccessKeyIds.length; i++) {
      var akid = userAccessKeyIds[i];

      if (key == akid) {
        userAccessKeyIds.splice(i, 1);
        userSecretAccessKeys.splice(i, 1);
        break;
      }
    }

    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
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

  get userAccessKeyIds() {
    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    return eval(userAccessKeyIds);
  },

  get userSecretAccessKeys() {
    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    return eval(userSecretAccessKeys);
  },

  mergeUserAccessKeyIds: function(data) {
    var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
    userAccessKeyIds = eval(userAccessKeyIds);

    for (var name in data) {
      var key = data[name];

      if (key) {
        userAccessKeyIds[name] = key;
      }
    }

    nsPreferences.setUnicharPref('iamfox.userAccessKeyIds', userAccessKeyIds.toSource());
  },

  mergeUserSecretAccessKeys: function(data) {
    var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
    userSecretAccessKeys = eval(userSecretAccessKeys);

    for (var name in data) {
      var key = data[name];

      if (key) {
        userSecretAccessKeys[name] = key;
      }
    }

    nsPreferences.setUnicharPref('iamfox.userSecretAccessKeys', userSecretAccessKeys.toSource());
  }
};

Prefs = {
  // XXX:
  current: 'Your name',
  version: '0.1.5',

  convert: function() {
    var version = nsPreferences.copyUnicharPref('iamfox.version', '').trim();

    if (!version) {
      var accessKeyId = nsPreferences.copyUnicharPref('iamfox.accessKeyId', '').trim();
      var secretAccessKey = nsPreferences.copyUnicharPref('iamfox.secretAccessKey', '').trim();
      var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
      userAccessKeyIds = eval(userAccessKeyIds);
      var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
      userSecretAccessKeys = eval(userSecretAccessKeys);

      var accounts = [
        [
          'Your name',
          {
            accessKeyId:accessKeyId,
            secretAccessKey:secretAccessKey,
            userAccessKeyIds:userAccessKeyIds,
            userSecretAccessKeys:userSecretAccessKeys
          }
        ]
      ];

      nsPreferences.setUnicharPref('iamfox.accounts', accounts.toSource());
      nsPreferences.setUnicharPref('iamfox.version', this.version);
    }
  },

  getAccount: function() {
    this.convert();

    var userName = this.current;

    if (!userName) {
      return {};
    }

    var accounts = nsPreferences.copyUnicharPref('iamfox.accounts', '([])');
    accounts = eval(accounts);

    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i][0] == userName) {
        return accounts[i][1];
      }
    }

    return {};
  },

  storeAccount: function(updated) {
    this.convert();

    var userName = this.current;

    if (!userName) {
      return;
    }

    var accounts = nsPreferences.copyUnicharPref('iamfox.accounts', '([])');
    accounts = eval(accounts);

    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i][0] == userName) {
        accounts[i][1] = updated;
        nsPreferences.setUnicharPref('iamfox.accounts', accounts.toSource());
        break;
      }
    }
  },

  get accessKeyId() {
    var account = this.getAccount();
    return (account.accessKeyId || '').trim();
  },

  set accessKeyId(v) {
    var account = this.getAccount();
    account.accessKeyId = v;
    this.storeAccount(account);
  },

  get secretAccessKey() {
    var account = this.getAccount();
    return (account.secretAccessKey || '').trim();
  },

  set secretAccessKey(v) {
    nsPreferences.setUnicharPref('iamfox.secretAccessKey', v);
  },

  getUserAccessKeyId: function(name) {
    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});
    var userAccessKeyId = (userAccessKeyIds[name] || []);

    if (typeof(userAccessKeyId) == "string") {
      userAccessKeyId = [userAccessKeyId];
    }

    return userAccessKeyId;
  },

  setUserAccessKeyId: function(name, key) {
    name = name.toString();
    key = key.toString();

    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});
    userAccessKeyIds[name] = [key];

    account.userAccessKeyIds = userAccessKeyIds;
    this.storeAccount(account);
  },

  addUserAccessKeyId: function(name, key) {
    name = name.toString();
    key = key.toString();

    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});
    var userAccessKeyId = (userAccessKeyIds[name] || []);

    if (typeof(userAccessKeyId) == "string") {
      userAccessKeyId = [userAccessKeyId];
    }

    userAccessKeyId.push(key);
    userAccessKeyIds[name] = userAccessKeyId;

    account.userAccessKeyIds = userAccessKeyIds;
    this.storeAccount(account);
  },

  deleteUserAccessKeyId: function(name) {
    name = name.toString();

    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});
    delete userAccessKeyIds[name];

    account.userAccessKeyIds = userAccessKeyIds;
    this.storeAccount(account);
  },

  getUserSecretAccessKey: function(name) {
    var account = this.getAccount();
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});
    var userSecretAccessKey = (userSecretAccessKeys[name] || []);

    if (typeof(userSecretAccessKey) == "string") {
      userSecretAccessKey = [userSecretAccessKey];
    }

    return userSecretAccessKey;
  },

  setUserSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var account = this.getAccount();
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});
    userSecretAccessKeys[name] = [key];

    account.userSecretAccessKeys = userSecretAccessKeys;
    this.storeAccount(account);
  },

  addUserSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var account = this.getAccount();
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});
    var userSecretAccessKey = (userSecretAccessKeys[name] || []);

    if (typeof(userSecretAccessKey) == "string") {
      userSecretAccessKey = [userSecretAccessKey];
    }

    userSecretAccessKey.push(key);
    userSecretAccessKeys[name] = userSecretAccessKey;

    account.userSecretAccessKeys = userSecretAccessKeys;
    this.storeAccount(account);
  },

  deleteUserSecretAccessKey: function(name) {
    name = name.toString();

    var account = this.getAccount();
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});
    delete userSecretAccessKeys[name];

    account.userSecretAccessKeys = userSecretAccessKeys;
    this.storeAccount(account);
  },

  deleteUserAccessKeyIdAndSecretAccessKey: function(name, key) {
    name = name.toString();
    key = key.toString();

    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});

    for (var i = 0; i < userAccessKeyIds.length; i++) {
      var akid = userAccessKeyIds[i];

      if (key == akid) {
        userAccessKeyIds.splice(i, 1);
        userSecretAccessKeys.splice(i, 1);
        break;
      }
    }

    account.userAccessKeyIds = userAccessKeyIds;
    account.userSecretAccessKeys = userSecretAccessKeys;
    this.storeAccount(account);
  },

  renameUserAccessKeyIdAndSecretAccessKey: function(old_name, new_name) {
    old_name = old_name.toString();
    new_name = new_name.toString();

    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});

    var accessKeyId = userAccessKeyIds[old_name];
    var secretAccessKeys = userSecretAccessKeys[old_name];
    userAccessKeyIds[new_name] = accessKeyId;
    userSecretAccessKeys[new_name] = secretAccessKeys;
    delete userAccessKeyIds[old_name];
    delete userSecretAccessKeys[old_name];

    account.userAccessKeyIds = userAccessKeyIds;
    account.userSecretAccessKeys = userSecretAccessKeys;
    this.storeAccount(account);
  },

  get userAccessKeyIds() {
    var account = this.getAccount();
    return (account.userAccessKeyIds || {});
  },

  get userSecretAccessKeys() {
    var account = this.getAccount();
    return (account.userSecretAccessKeys || {});
  },

  mergeUserAccessKeyIds: function(data) {
    var account = this.getAccount();
    var userAccessKeyIds = (account.userAccessKeyIds || {});

    for (var name in data) {
      var key = data[name];

      if (key) {
        userAccessKeyIds[name] = key;
      }
    }

    account.userAccessKeyIds = userAccessKeyIds;
    this.storeAccount(account);
  },

  mergeUserSecretAccessKeys: function(data) {
    var account = this.getAccount();
    var userSecretAccessKeys = (account.userSecretAccessKeys || {});

    for (var name in data) {
      var key = data[name];

      if (key) {
        userSecretAccessKeys[name] = key;
      }
    }

    account.userSecretAccessKeys = userSecretAccessKeys;
    this.storeAccount(account);
  }
};

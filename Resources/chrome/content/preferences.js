Prefs = {
  // XXX:
  version: '0.1.5',

  convert: function() {
    var version = nsPreferences.copyUnicharPref('iamfox.version', '').trim();
    var accessKeyId = nsPreferences.copyUnicharPref('iamfox.accessKeyId', '').trim();

    if (!version && accessKeyId) {
      var secretAccessKey = nsPreferences.copyUnicharPref('iamfox.secretAccessKey', '').trim();
      var userAccessKeyIds = nsPreferences.copyUnicharPref('iamfox.userAccessKeyIds', '({})');
      userAccessKeyIds = eval(userAccessKeyIds);
      var userSecretAccessKeys = nsPreferences.copyUnicharPref('iamfox.userSecretAccessKeys', '({})');
      userSecretAccessKeys = eval(userSecretAccessKeys);

      Prefs.currentUser = 'Your name';

      var accounts = [
        [
          Prefs.currentUser,
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

  get currentUser() {
    return nsPreferences.copyUnicharPref('iamfox.currentUser', null);
  },

  set currentUser(v) {
    nsPreferences.setUnicharPref('iamfox.currentUser', v);
  },

  getAccountList: function() {
    this.convert();
    var accounts = nsPreferences.copyUnicharPref('iamfox.accounts', '([])');
    return eval(accounts);
  },

  storeAccountList: function(updated) {
    nsPreferences.setUnicharPref('iamfox.accounts', updated.toSource());
  },

  addAccount: function(userName, accessKeyId, secretAccessKey) {
    var accounts = this.getAccountList();

    var newAccount = [
      userName,
      {
        accessKeyId:accessKeyId,
        secretAccessKey:secretAccessKey
      }
    ];

    var index = -1;

    for(var i = 0; i < accounts.length; i++) {
      if (accounts[i][0] == userName) {
        index = i;
        break;
      }
    }

    if (index == -1) {
      accounts.push(newAccount);
    } else {
      accounts.splice(index, 1, newAccount);
    }

    this.storeAccountList(accounts);

    if (accounts.length == 1) {
      this.currentUser = accounts[0][0];
    }
  },

  deleteAccount: function(userName) {
    var accounts = this.getAccountList();
    var index = -1;

    for(var i = 0; i < accounts.length; i++) {
      if (accounts[i][0] == userName) {
        index = i;
        break;
      }
    }

    if (index != -1) {
      accounts.splice(index, 1);
      this.storeAccountList(accounts);

      if (accounts.length > 0) {
        this.currentUser = accounts[0][0];
      } else {
        this.currentUser = '';
      }
    }
  },

  getAccount: function() {
    var accounts = this.getAccountList();

    var userName = this.currentUser;
    if (!userName) { return {}; }

    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i][0] == userName) {
        return accounts[i][1];
      }
    }

    return {};
  },

  storeAccount: function(updated) {
    var accounts = this.getAccountList();

    var userName = this.currentUser;
    if (!userName) { return; }

    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i][0] == userName) {
        accounts[i][1] = updated;
        this.storeAccountList(accounts);
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

Prefs = {
  prefs: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),

  get accessKeyId() {
    return nsPreferences.copyUnicharPref('iamfox.accessKeyId', '').trim();
  },

  set accessKeyId(v) {
    try {
    nsPreferences.setUnicharPref('iamfox.accessKeyId', v);
    } catch(e) {
      alert(e);
    }
  },

  get secretAccessKey() {
    return nsPreferences.copyUnicharPref('secretAccessKey', '').trim();
  },

  set secretAccessKey(v) {
    nsPreferences.setUnicharPref('secretAccessKey', v);
  }
};

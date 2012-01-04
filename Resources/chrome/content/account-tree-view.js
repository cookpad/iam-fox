function AccountTreeView(userNameElement, accessKeyIdElement, secretAccessKeyElement) {
  this.userNameElement = userNameElement;
  this.accessKeyIdElement = accessKeyIdElement;
  this.secretAccessKeyElement = secretAccessKeyElement;

  this.rowCount = 0;
  this.selection = null;
  this.sorted = false;
  this.data = [];
}

AccountTreeView.prototype = {
  updateData: function() {
    var accounts = Prefs.getAccountList();
    var data = [];

    for (var i = 0; i < accounts.length; i++) {
      var account = accounts[i];
      data.push([account[0], account[1].accessKeyId, account[1].secretAccessKey]);
    }

    this.data = data;
  },

  getCellText: function(row, column) {
    if (column.id == 'account-tree-use') {
      return null;
    }

    var accounts = Prefs.getAccountList();

    var idx = column.id.toString().split('.');
    idx = idx[idx.length - 1];

    return this.data[row][idx];
  },

  getCellValue: function(row, column) {
    if (column.id != 'account-tree-use') {
      return null;
    }

    var userName = this.data[row][0];
    var currentUser = Prefs.currentUser;

    return (currentUser && (currentUser == userName));
  },

  setTree: function(tree) {
    this.tree = tree;
  },

  isEditable: function(row, column) {
    return (column.id == 'account-tree-use');
  },

  setCellValue: function(row, column, value) {
    if (!value) { return; }

    var userName = this.data[row][0];
    Prefs.currentUser = userName;
    this.refresh();
  },

  refresh: function() {
    this.updateData();

    if (this.rowCount != this.data.length) {
      this.tree.rowCountChanged(0, -this.rowCount);
      this.rowCount = this.data.length;
      this.tree.rowCountChanged(0, this.rowCount);
    }

    this.tree.invalidate();
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.data[idx] : null;
  },

  copyColumnToClipboard: function(name) {
    var row = this.selectedRow();

    if (row) {
      var value = (row[name] || '').toString().trim();
      if (!value) { value = '(empty)'; }
      copyToClipboard(value);
    }
  },

  addAccount: function(userName, accessKeyId, secretAccessKey) {
    Prefs.addAccount(userName, accessKeyId, secretAccessKey);
    this.refresh();
  },

  deleteAccount: function() {
    var row = this.selectedRow();
    if (!row) { return; }

    var userName = row[0];

    if (!confirm("Are you sure you want to delete '" + userName + "' ?")) {
      return;
    }

    Prefs.deleteAccount(userName);
    this.refresh();
  },

  onDblclick: function(event) {
    var row = this.selectedRow();

    if (!row || (event && event.target.tagName != 'treechildren')) {
      return;
    }

    this.userNameElement.value = row[0];
    this.accessKeyIdElement.value = row[1];
    this.secretAccessKeyElement.value = row[2];
  }
};

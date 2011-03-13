function UserTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.rowCount = 0;
  this.selection= null;
}

UserTreeView.prototype = {
  getCellText: function(row, column) {
    return this.rows[row][column.id];
  },

  setTree: function(tree) {
    this.tree = tree;
  },

  updateRowCount: function() {
    if (this.rowCount == this.rows.length) {
      return;
    }

    this.tree.rowCountChanged(0, -this.rowCount);
    this.rowCount = this.rows.length;
    this.tree.rowCountChanged(0, this.rowCount);
  },

  refresh: function(noupdate) {
    this.rows.length = 0;
    var xhr = null;

    protect(function() {
      xhr = inProgress(function() {
        return this.iamcli.query('ListUsers');
      }.bind(this));
    }.bind(this));

    if_xhr_success(xhr, function() {
      for each (var member in xhr.xml()..Users.member) {
        this.rows.push(member);
      }

      this.updateRowCount();
      this.tree.invalidate();
    }.bind(this));
  },

  onDblclick: function(event) {
    var user = this.selectedRow();
    var userName = user.UserName;
    var xhr = null;

    openModalWindow('user-detail-window.xul', 'user-datail-window', 640, 480,
                    {iamcli:this.iamcli, userName:userName});
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.rows[idx] : null;
  },

  deleteCurrentRow: function() {
    var idx = this.selection.currentIndex;

    if (idx != -1) {
      this.rows.splice(idx, 1);
      this.updateRowCount();
    }
  },

  createAccessKey: function() {
    var user = this.selectedRow();
    var userName = user.UserName;

    protect(function() {
      xhr = inProgress(function() {
        return this.iamcli.query('CreateAccessKey', [['UserName', userName]]);
      }.bind(this));
    }.bind(this));

    if_xhr_success(xhr, function() {
      var accessKey = xhr.xml()..CreateAccessKeyResult.AccessKey;
      alert(accessKey);
    }.bind(this));
  },

  deleteUser: function() {
    var user = this.selectedRow();
    var userName = user.UserName;

    if (!confirm("Are you sure you want to delete '" + userName + " ' ?")) {
      return;
    }

    protect(function() {
      xhr = inProgress(function() {
        return this.iamcli.query('DeleteUser', [['UserName', userName]]);
      }.bind(this));
    }.bind(this));

    if_xhr_success(xhr, function() {
      this.deleteCurrentRow();
      this.tree.invalidate();
    }.bind(this));
  }
};

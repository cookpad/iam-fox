function UserTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.rowCount = 0;
  this.selection = null;
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

    protect(function() {
      var xhr = inProgress(function() {
        return this.iamcli.query_or_die('ListUsers');
      }.bind(this));

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

  deleteUser: function() {
    var user = this.selectedRow();
    var userName = user.UserName;

    if (!confirm("Are you sure you want to delete '" + userName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        var xhr = this.iamcli.query_or_die('ListAccessKeys', [['UserName', userName]]);

        for each (var member in xhr.xml()..AccessKeyMetadata.member) {
          var params = [['UserName', userName], ['AccessKeyId', member.AccessKeyId]];
          this.iamcli.query_or_die('DeleteAccessKey', params);
        }

        xhr = this.iamcli.query_or_die('ListUserPolicies', [['UserName', userName]]);

        for each (var member in xhr.xml()..PolicyNames.member) {
          var params = [['UserName', userName], ['PolicyName', member]];
          this.iamcli.query_or_die('DeleteUserPolicy', params);
        }

        this.iamcli.query_or_die('DeleteUser', [['UserName', userName]]);

        this.deleteCurrentRow();
        this.tree.invalidate();
      }.bind(this));
    }.bind(this));
  },

  openUserEditDialog: function() {
    var user = this.selectedRow();
    openDialog('chrome://iamfox/content/user-edit-dialog.xul', 'user-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, user:user});
  },

  openViewKeyDialog: function() {
    var user = this.selectedRow();
    openDialog('chrome://iamfox/content/user-view-key-dialog.xul', 'user-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, user:user});
  },

  selectByName: function(name) {
    var rows = this.rows;

    for (var i = 0; i < rows.length; i++) {
      var user = rows[i];

      if (user.UserName == name) {
        this.selection.select(i);
      }
    }

    this.rows
  },

  openUserCertWindow: function(event) {
    var user = this.selectedRow();
    var userName = user.UserName;

    openModalWindow('user-cert-window.xul', 'user-cert-window', 640, 480,
                    {iamcli:this.iamcli, userName:userName});
  },

  deleteUser: function() {
    var user = this.selectedRow();
    var userName = user.UserName;

    if (!confirm("Are you sure you want to delete '" + userName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        var xhr = this.iamcli.query_or_die('ListAccessKeys', [['UserName', userName]]);

        for each (var member in xhr.xml()..AccessKeyMetadata.member) {
          var params = [['UserName', userName], ['AccessKeyId', member.AccessKeyId]];
          this.iamcli.query_or_die('DeleteAccessKey', params);
        }

        xhr = this.iamcli.query_or_die('ListUserPolicies', [['UserName', userName]]);

        for each (var member in xhr.xml()..PolicyNames.member) {
          var params = [['UserName', userName], ['PolicyName', member]];
          this.iamcli.query_or_die('DeleteUserPolicy', params);
        }

        this.iamcli.query_or_die('DeleteUser', [['UserName', userName]]);

        this.deleteCurrentRow();
        this.tree.invalidate();
      }.bind(this));
    }.bind(this));
  },

  openUserEditDialog: function() {
    var user = this.selectedRow();
    openDialog('chrome://iamfox/content/user-edit-dialog.xul', 'user-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, user:user});
  },

  openViewKeyDialog: function() {
    var user = this.selectedRow();
    openDialog('chrome://iamfox/content/user-view-key-dialog.xul', 'user-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, user:user});
  },

  selectByName: function(name) {
    var rows = this.rows;

    for (var i = 0; i < rows.length; i++) {
      var user = rows[i];

      if (user.UserName == name) {
        this.selection.select(i);
      }
    }

    this.rows
  },

  openUserGroupWindow: function() {
    var user = this.selectedRow();

    openModalWindow('user-group-window.xul', 'user-cert-window', 400, 400,
                    {iamcli:this.iamcli, userName:user.UserName});
  },
};

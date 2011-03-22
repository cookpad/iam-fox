function GroupTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.rowCount = 0;
  this.selection = null;
}

GroupTreeView.prototype = {
  getCellText: function(row, column) {
    var colkey = column.id.toString().split('.');

    if (colkey.length < 1) {
      return null;
    }

    colkey = colkey[colkey.length - 1];

    return this.rows[row][colkey];
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

  refresh: function() {
    this.rows.length = 0;

    protect(function() {
      var xhr = inProgress(function() {
        return this.iamcli.query_or_die('ListGroups');
      }.bind(this));

      for each (var member in xhr.xml()..Groups.member) {
        this.rows.push(member);
      }

      this.updateRowCount();
      this.tree.invalidate();
    }.bind(this));
  },

  onDblclick: function(event) {
    var group = this.selectedRow();
    var groupName = group.GroupName;

    openModalWindow('group-detail-window.xul', 'group-datail-window', 640, 480,
                    {iamcli:this.iamcli, groupName:groupName});
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

  deleteGroup: function() {
    var group = this.selectedRow();
    var groupName = group.GroupName;

    if (!confirm("Are you sure you want to delete '" + groupName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        var xhr = this.iamcli.query_or_die('ListGroupPolicies', [['GroupName', groupName]]);

        for each (var member in xhr.xml()..PolicyNames.member) {
          var params = [['GroupName', groupName], ['PolicyName', member]];
          this.iamcli.query_or_die('DeleteGroupPolicy', params);
        }

        this.iamcli.query_or_die('DeleteGroup', [['GroupName', groupName]]);

        this.deleteCurrentRow();
        this.tree.invalidate();
      }.bind(this));
    }.bind(this));
  },

  openGroupEditDialog: function() {
    var group = this.selectedRow();
    openDialog('chrome://iamfox/content/group-edit-dialog.xul', 'group-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, group:group});
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
  }
};

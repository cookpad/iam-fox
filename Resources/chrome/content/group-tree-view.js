function GroupTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.rowCount = 0;
  this.selection= null;
}

GroupTreeView.prototype = {
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

  refresh: function() {
    this.rows.length = 0;

    protect(function() {
      var xhr = inProgress(function() {
        return this.iamcli.query('ListGroups');
      }.bind(this));

      if (!xhr.success()) {
        alert(xhr.responseText);
        return;
      }

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
    var policyNames = [];

    protect(function() {
      inProgress(function() {
        var listGroupPolicies = this.iamcli.query('ListGroupPolicies', [['GroupName', groupName]]);

        for each (var member in listGroupPolicies.xml()..PolicyNames.member) {
          policyNames.push(member);
        }
      }.bind(this));
    }.bind(this));

    openModalWindow('group-detail-window.xul', 'group-datail-window', 640, 480,
                    {iamcli:this.iamcli, groupName:groupName, policyNames:policyNames});
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.rows[idx] : null;
  }
};

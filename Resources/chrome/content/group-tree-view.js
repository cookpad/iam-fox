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
    var policies = [];

    protect(function() {
      var groupName = group.GroupName;

      inProgress(function() {
        var listGroupPolicies = this.iamcli.query('ListGroupPolicies', [['GroupName', groupName]]);
        var names = [];

        for each (var member in listGroupPolicies.xml()..PolicyNames.member) {
          names.push(member);
        }

        for each (name in names) {
          var params =  [['GroupName', groupName], ['PolicyName', name]];
          var getGroupPolicy = this.iamcli.query('GetGroupPolicy', params);
          policies.push(getGroupPolicy.xml().GetGroupPolicyResult);
        }
      }.bind(this));

      if (policies.length > 0) {
        buf = "";

        for each (policy in policies) {
          buf += policy.PolicyName + '\n';
          buf += '---\n';
          buf += decodeURIComponent(policy.PolicyDocument) + '\n';
        }

        alert(buf);
      } else {
        alert('empty action');
      }
    }.bind(this));
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.rows[idx] : null;
  }
};

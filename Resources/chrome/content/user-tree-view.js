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

    protect(function() {
      var xhr = inProgress(function() {
        return this.iamcli.query('ListUsers');
      }.bind(this));

      if (!xhr.success()) {
        alert(xhr.responseText);
        return;
      }

      for each (var member in xhr.xml()..Users.member) {
        this.rows.push(member);
      }

      this.updateRowCount();
      this.tree.invalidate();
    }.bind(this));
  },

  onDblclick: function(event) {
    var user = this.selectedRow();
    var policies = [];

    protect(function() {
      var userName = user.UserName;

      inProgress(function() {
        var listUserPolicies = this.iamcli.query('ListUserPolicies', [['UserName', userName]]);
        var names = [];

        for each (var member in listUserPolicies.xml()..PolicyNames.member) {
          names.push(member);
        }

        for (var i = 0; i < names.length; i++) {
          var name = names[i];
          var params =  [['UserName', userName], ['PolicyName', name]];
          var getUserPolicy = this.iamcli.query('GetUserPolicy', params);
          policies.push(getUserPolicy.xml().GetUserPolicyResult);
        }
      }.bind(this));

      if (policies.length > 0) {
        buf = "";

        for (var i = 0; i < policies.length; i++) {
          var policy = policies[i];
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

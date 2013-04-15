function UserViewKeyTreeView(user, iamcli, inProgress) {
  this.user = user;
  this.iamcli = iamcli;
  this.inProgress = inProgress;
  this.rowCount = 0;
  this.selection = null;
  this.sorted = false;
  this.data = [];
}

UserViewKeyTreeView.prototype = {
  updateData: function() {
    var accessKeyId = Prefs.getUserAccessKeyId(this.user.UserName);
    var secretAccessKey = Prefs.getUserSecretAccessKey(this.user.UserName);
    var hash = {};
    var data = [];

    for (var i = 0; i < accessKeyId.length; i++) {
      hash[accessKeyId[i]] = secretAccessKey[i];
    }

    protect(function() {
      this.inProgress(function() {
        var walk = function(marker) {
          var params = [['UserName', this.user.UserName]];

          if (marker) {
            params.push(['Marker', marker])
          }

          var xhr = this.iamcli.query_or_die('ListAccessKeys', params);
          var xml = xhr.xml();

          for each (var member in xml..AccessKeyMetadata.member) {
            var akid =  member.AccessKeyId.toString();
            data.push([akid, hash[akid]]);
          }

          var isTruncated = ((xml..IsTruncated || '').toString().trim().toLowerCase() == 'true');

          return isTruncated ? (xml..Marker || '').toString().trim() : null;
        }.bind(this);

        var marker = null;

        do {
          marker = walk(marker);
        } while (marker);
      }.bind(this));
    }.bind(this));

    this.data = data;
  },

  getCellText: function(row, column) {
    var idx = column.id.toString().split('.');
    idx = idx[idx.length - 1];

    return this.data[row][idx];
  },

  setTree: function(tree) {
    this.tree = tree;
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

  addKey: function() {
    protect(function() {
      this.inProgress(function() {
        var userName = this.user.UserName;
        var xhr = this.iamcli.query_or_die('CreateAccessKey', [['UserName', userName]]);

        var accessKey = xhr.xml()..CreateAccessKeyResult.AccessKey;
        var accessKeyId = accessKey.AccessKeyId.toString().trim();
        var secretAccessKey = accessKey.SecretAccessKey.toString().trim()

        Prefs.addUserAccessKeyId(userName, accessKeyId);
        Prefs.addUserSecretAccessKey(userName, secretAccessKey);

        this.refresh();
      }.bind(this));
    }.bind(this));
  },

  deleteKey: function() {
    var row = this.selectedRow();
    if (!row) { return; }

    var akid = row[0];

    if (!confirm("Are you sure you want to delete '" + akid + "' ?")) {
      return;
    }

    protect(function() {
      this.inProgress(function() {
        var userName = this.user.UserName;
        var params = [['UserName', userName], ['AccessKeyId', akid]];
        this.iamcli.query_or_die('DeleteAccessKey', params);

        Prefs.deleteUserAccessKeyIdAndSecretAccessKey(userName, akid);

        this.refresh();
      }.bind(this));
    }.bind(this));
  }
};

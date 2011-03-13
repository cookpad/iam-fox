function SigningCertTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.rowCount = 0;
  this.selection = null;
}

SigningCertTreeView.prototype = {
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
        return this.iamcli.query_or_die('ListSigningCertificates');
      }.bind(this));

      for each (var member in xhr.xml()..Certificates.member) {
        this.rows.push(member);
      }

      this.updateRowCount();
      this.tree.invalidate();
    }.bind(this));
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

  deleteSigningCert: function() {
    var cert = this.selectedRow();
    var certId = group.CertificateId;
    var userName = group.UserName;

    if (!confirm("Are you sure you want to delete '" + certId + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        this.iamcli.query_or_die('DeleteSigningCertificate', [['CertificateId', certId], ['UserName', userName]]);

        this.deleteCurrentRow();
        this.tree.invalidate();
      }.bind(this));
    }.bind(this));
  },

  openSigningCertEditDialog: function() {
    /*
    var group = this.selectedRow();
    openDialog('chrome://iamfox/content/group-edit-dialog.xul', 'group-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, group:group});
     */
  },

  selectById: function(certId) {
    var rows = this.rows;

    for (var i = 0; i < rows.length; i++) {
      var user = rows[i];

      if (user.CertificateId == certId) {
        this.selection.select(i);
      }
    }

    this.rows
  }
};

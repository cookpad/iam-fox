function ServerCertTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.printedRows = [];
  this.rowCount = 0;
  this.selection = null;
  this.sorted = false;
}

ServerCertTreeView.prototype = {
  getCellText: function(row, column) {
    var colkey = column.id.toString().split('.');

    if (colkey.length < 1) {
      return null;
    }

    colkey = colkey[colkey.length - 1];

    return this.printedRows[row][colkey];
  },

  setTree: function(tree) {
    this.tree = tree;
  },

  isSorted: function() {
    return this.sorted;
  },

  cycleHeader: function(column) {
    var cert = this.selectedRow();

    if (sortRowsByColumn(column, this.rows)) {
      this.invalidate();
      this.sorted = true;

      if (cert) {
        this.selectByName(cert.ServerCertificateName);
      }
    }
  },

  invalidate: function() {
    this.printedRows.length = 0;

    var filter = null;
    var filterValue = ($('server-cert-tree-filter').value || '').trim();

    if (filterValue) {
      filter = function(elem) {
        var r = new RegExp(filterValue);

        for each (var child in elem.*) {
          if (r.test(child.toString())) {
            return true;
          }
        }

        return false;
      };
    } else {
      filter = function(elem) {
        return true;
      };
    }
 
    for (var i = 0; i < this.rows.length; i++) {
      var row =  this.rows[i];

      if (filter(row)) {
        this.printedRows.push(row);
      }
    }

    if (this.rowCount != this.printedRows.length) {
      this.tree.rowCountChanged(0, -this.rowCount);
      this.rowCount = this.printedRows.length;
      this.tree.rowCountChanged(0, this.rowCount);
    }

    this.tree.invalidate();
   },

  refresh: function() {
    this.rows.length = 0;

    protect(function() {
      var xhr = inProgress(function() {
        return this.iamcli.query_or_die('ListServerCertificates');
      }.bind(this));

      for each (var member in xhr.xml()..ServerCertificateMetadataList.member) {
        this.rows.push(member);
      }

      this.invalidate();
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
    }
  },

  deleteServerCert: function() {
    var cert = this.selectedRow();
    var certName = cert.ServerCertificateName;

    if (!confirm("Are you sure you want to delete '" + certName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        this.iamcli.query_or_die('DeleteServerCertificate', [['ServerCertificateName', certName]]);

        this.deleteCurrentRow();
        this.invalidate();
      }.bind(this));
    }.bind(this));
  },

  openServerCertEditDialog: function(event) {
    var cert = this.selectedRow();

    if (!cert || (event && event.target.tagName != 'treechildren')) {
      return;
    }

    openDialog('chrome://iamfox/content/server-cert-edit-dialog.xul', 'server-cert-edit-dialog', 'chrome,modal',
               {view:this, inProgress:inProgress, cert:cert});
  },

  selectByName: function(name) {
    var rows = this.rows;

    for (var i = 0; i < rows.length; i++) {
      var user = rows[i];

      if (user.ServerCertificateName == name) {
        this.selection.select(i);
      }
    }

    this.rows
  }
};

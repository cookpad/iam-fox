function ServerCertTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.printRows = [];
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

    return this.printRows[row][colkey];
  },

  setTree: function(tree) {
    this.tree = tree;
  },

  isSorted: function() {
    return this.sorted;
  },

  cycleHeader: function(column) {
    var cert = this.selectedRow();
    if (!cert) { return; }

    if (sortRowsByColumn(column, this.rows)) {
      this.invalidate();
      this.sorted = true;

      if (cert) {
        this.selectByName(cert.ServerCertificateName);
      }
    }
  },

  invalidate: function() {
    this.printRows.length = 0;

    var pathFilter = $('server-cert-tree-path-filter').selectedItem;
    var pathValue = pathFilter ? pathFilter.value : '/';
    var filterValue = ($('server-cert-tree-filter').value || '').trim();

    function filter(elem) {
      var rp = new RegExp('^' + pathValue);
      var rv = new RegExp(filterValue);

      if (!rp.test(elem.Path.toString())) {
        return false;
      }

      for each (var child in elem.*) {
        if (rv.test(child.toString())) {
          return true;
        }
      }

      return false;
    };

    for (var i = 0; i < this.rows.length; i++) {
      var row =  this.rows[i];

      if (filter(row)) {
        this.printRows.push(row);
      }
    }

    if (this.rowCount != this.printRows.length) {
      this.tree.rowCountChanged(0, -this.rowCount);
      this.rowCount = this.printRows.length;
      this.tree.rowCountChanged(0, this.rowCount);
    }

    this.tree.invalidate();
  },

  refresh: function() {
    this.rows.length = 0;

    protect(function() {
      var pathList = ['/'];

      var walk = function(marker) {
        var params = [];

        if (marker) {
          params.push(['Marker', marker])
        }

        var xhr = inProgress(function() {
          return this.iamcli.query_or_die('ListServerCertificates', params);
        }.bind(this));

        var xml = xhr.xml();

        for each (var member in xml..ServerCertificateMetadataList.member) {
          this.rows.push(member);
          pathList.push(member.Path.toString());
        }

        var isTruncated = ((xml..IsTruncated || '').toString().trim().toLowerCase() == 'true');

        return isTruncated ? (xml..Marker || '').toString().trim() : null;
      }.bind(this);

      var marker = null;

      do {
        marker = walk(marker);
      } while (marker);

      var pathFilter = $('server-cert-tree-path-filter');
      pathFilter.removeAllItems();
      pathList = pathList.uniq().sort();

      for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        pathFilter.appendItem(path, path);
      }

      pathFilter.selectedIndex = 0;

      for (var i = 0; i < this.tree.columns.count; i++) {
        this.tree.columns.getColumnAt(i).element.setAttribute('sortDirection', 'natural');
      }

      this.invalidate();
    }.bind(this));
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.printRows[idx] : null;
  },

  deleteServerCert: function() {
    var cert = this.selectedRow();
    if (!cert) { return; }
    var certName = cert.ServerCertificateName;

    if (!confirm("Are you sure you want to delete '" + certName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        this.iamcli.query_or_die('DeleteServerCertificate', [['ServerCertificateName', certName]]);

        this.refresh();
      }.bind(this));
    }.bind(this));
  },

  openServerCertEditDialog: function(event) {
    var cert = this.selectedRow();

    if (!cert || (event && event.target.tagName != 'treechildren')) {
      return;
    }

    openDialog('chrome://iamfox/content/server-cert-edit-dialog.xul', 'server-cert-edit-dialog', 'chrome,modal,centerscreen',
               {view:this, inProgress:inProgress, cert:cert});
  },

  selectByName: function(name) {
    var rows = this.rows;

    for (var i = 0; i < rows.length; i++) {
      var cert = rows[i];

      if (cert.ServerCertificateName == name) {
        this.selection.select(i);
      }
    }

    this.rows
  },

  copyColumnToClipboard: function(name) {
    var row = this.selectedRow();

    if (row) {
      copyToClipboard(row[name].toString());
    }
  }
};

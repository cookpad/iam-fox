function GroupTreeView(iamcli) {
  this.iamcli = iamcli;
  this.rows = [];
  this.printRows = [];
  this.rowCount = 0;
  this.selection = null;
  this.sorted = false;
}

GroupTreeView.prototype = {
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
    var group = this.selectedRow();
    if (!group) { return; }

    if (sortRowsByColumn(column, this.rows)) {
      this.invalidate();
      this.sorted = true;

      if (group) {
        this.selectByName(group.GroupName);
      }
    }
  },

  invalidate: function() {
    this.printRows.length = 0;

    var pathFilter = $('group-tree-path-filter').selectedItem;
    var pathValue = pathFilter ? pathFilter.value : '/';
    var filterValue = ($('group-tree-filter').value || '').trim();

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
          return this.iamcli.query_or_die('ListGroups', params);
        }.bind(this));

        var xml = xhr.xml();

        for each (var member in xml..Groups.member) {
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

      var pathFilter = $('group-tree-path-filter');
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

  onDblclick: function(event) {
    var group = this.selectedRow();

    if (!group || (event && event.target.tagName != 'treechildren')) {
      return;
    }

    var groupName = group.GroupName;

    openModalWindow('group-detail-window.xul', 'group-datail-window', 640, 480,
                    {iamcli:this.iamcli, groupName:groupName});
  },

  selectedRow: function() {
    var idx = this.selection.currentIndex;
    return (idx != -1) ? this.printRows[idx] : null;
  },

  deleteGroup: function() {
    var group = this.selectedRow();
    if (!group) { return; }
    var groupName = group.GroupName;

    if (!confirm("Are you sure you want to delete '" + groupName + " ' ?")) {
      return;
    }

    protect(function() {
      inProgress(function() {
        var walk = function(marker) {
          var params = [['GroupName', groupName]];

          if (marker) {
            params.push(['Marker', marker])
          }

          var xhr = this.iamcli.query_or_die('ListGroupPolicies', params);
          var xml = xhr.xml();

          for each (var member in xml..PolicyNames.member) {
            var params = [['GroupName', groupName], ['PolicyName', member]];
            this.iamcli.query_or_die('DeleteGroupPolicy', params);
          }

          var isTruncated = ((xml..IsTruncated || '').toString().trim().toLowerCase() == 'true');

          return isTruncated ? (xml..Marker || '').toString().trim() : null;
        }.bind(this);

        var marker = null;

        do {
          marker = walk(marker);
        } while (marker);

        this.iamcli.query_or_die('DeleteGroup', [['GroupName', groupName]]);

        this.refresh();
      }.bind(this));
    }.bind(this));
  },

  openGroupEditDialog: function() {
    var group = this.selectedRow();
    if (!group) { return; }
    openDialog('chrome://iamfox/content/group-edit-dialog.xul', 'group-edit-dialog', 'chrome,modal,centerscreen',
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
  },

  copyColumnToClipboard: function(name) {
    var row = this.selectedRow();

    if (row) {
      copyToClipboard(row[name].toString());
    }
  }
};

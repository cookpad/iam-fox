function windowOnLoad() {
  var args = window.arguments[0];
  document.title = 'Group - ' + args.userName;
  var listbox = $('user-group-listbox');
  refreshUserGroup();
}

function inProgress(callback) {
  var loader = $('user-group-loader');
  loader.hidden = false;

  var retval = null;
  var exception = null;

  try {
    retval = callback();
  } catch (e) {
    exception = e;
  }

  loader.hidden = true;

  if (exception) {
    throw exception;
  }

  return retval;
}

function addUserToGroup() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var menulist = $('user-group-menulist');
  var item = menulist.selectedItem;

  if (!item || !item.value) {
    alert("Please select 'Group'.");
    return;
  }

  var groupName = item.value;

  protect(function() {
    inProgress(function() {
      var params = [['UserName', userName], ['GroupName', groupName]];
      iamcli.query_or_die('AddUserToGroup', params);
    });

    refreshUserGroup();
  });
}

function removeUserFromGroup() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var listbox = $('user-group-listbox');
  var item = listbox.selectedItem;

  if (!item || !item.value) {
    return;
  }

  var groupName = item.value;

  if (!confirm("Are you sure you want to remove '" + userName + "' from '" + groupName + " ' ?")) {
    return;
  }

  protect(function() {
    inProgress(function() {
      var params = [['UserName', userName], ['GroupName', groupName]];
      iamcli.query_or_die('RemoveUserFromGroup', params);
    });

    refreshUserGroup();
  });
}

function refreshUserGroup() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var menulist = $('user-group-menulist');
  var listbox = $('user-group-listbox');

  protect(function() {
    var groups = [];
    var belongs_to = [];

    inProgress(function() {
      var walk = function(marker) {
        var params = [];

        if (marker) {
          params.push(['Marker', marker])
        }

        var xhr = iamcli.query_or_die('ListGroups', params);
        var xml = xhr.xml();

        for each (var member in xml..Groups.member) {
          groups.push(member.GroupName.toString());
        }

        var isTruncated = ((xml..IsTruncated || '').toString().trim().toLowerCase() == 'true');

        return isTruncated ? (xml..Marker || '').toString().trim() : null;
      }.bind(this);

      var marker = null;

      do {
        marker = walk(marker);
      } while (marker);
    });

    var xhr = inProgress(function() {
      var walk = function(marker) {
        var params = [['UserName', userName]];

        if (marker) {
          params.push(['Marker', marker])
        }

        var xhr = iamcli.query_or_die('ListGroupsForUser', params);
        var xml = xhr.xml();

        for each (var member in xhr.xml()..Groups.member) {
          belongs_to.push(member.GroupName.toString());
        }

        var isTruncated = ((xml..IsTruncated || '').toString().trim().toLowerCase() == 'true');

        return isTruncated ? (xml..Marker || '').toString().trim() : null;
      }.bind(this);

      var marker = null;

      do {
        marker = walk(marker);
      } while (marker);
    });

    var listbox = $('user-group-listbox');

    listbox.clearSelection();

    for (var i = listbox.itemCount - 1; i >= 0; i--) {
      listbox.removeItemAt(i);
    }

    for (var i = 0; i < belongs_to.length; i++) {
      var groupName = belongs_to[i];
      listbox.appendItem(groupName, groupName);
    }

    var menulist = $('user-group-menulist');

    menulist.removeAllItems();

    for (var i = 0; i < groups.length; i++) {
      var groupName = groups[i];

      if (belongs_to.indexOf(groupName) == -1) {
        menulist.appendItem(groupName, groupName);
      }
    }
  });
}

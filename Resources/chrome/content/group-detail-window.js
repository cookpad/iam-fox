function windowOnLoad() {
  var args = window.arguments[0];
  document.title = 'Group - ' + args.groupName;
  refreshGroupPolicy();
}

function listboxOnSelect(event) {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;

  var item = event.currentTarget;

  if (!item || !item.value) {
    return;
  }

  var policyName = item.value;

  protect(function() {
    var xhr = inProgress(function() {
      var params =  [['GroupName', groupName], ['PolicyName', policyName]];
      return iamcli.query_or_die('GetGroupPolicy', params);
    });

    var textbox = $('group-policy-textbox');
    var policy = xhr.xml().GetGroupPolicyResult;
    textbox.value = decodeURIComponent(policy.PolicyDocument);
    disableUpdateButton();
  });
}

function inProgress(callback) {
  var loader = $('group-policy-loader');
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

function addGroupPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;
  var xhr = null;

  var policyName = prompt('Policy Name');
  policyName = (policyName || '').trim();

  if (policyName.length < 1) {
    return;
  }

  var listbox = $('group-policy-listbox');

  for (var i = 0; i < listbox.itemCount; i++) {
    var item = listbox.getItemAtIndex(i);

    if (item.value == policyName) {
      alert('Duplicate policy');
      return;
    }
  }

  protect(function() {
    inProgress(function() {
      var params = [
        ['GroupName', groupName],
        ['PolicyName', policyName],
        ['PolicyDocument', POLICY_ALLOW_ALL]
        ];

      iamcli.query_or_die('PutGroupPolicy', params);
    });

    var textbox = $('group-policy-textbox');
    var item = listbox.appendItem(policyName, policyName);
    listbox.selectItem(item);
    textbox.value = POLICY_ALLOW_ALL;
    disableUpdateButton();
  });
}

function deleteGroupPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;

  var listbox = $('group-policy-listbox');
  var item = listbox.selectedItem;

  if (!item || !item.value) {
    return;
  }

  var policyName = item.value;

  if (!confirm("Are you sure you want to delete '" + policyName + " ' ?")) {
    return;
  }

  protect(function() {
    inProgress(function() {
      var params = [['GroupName', groupName], ['PolicyName', policyName]];
      iamcli.query_or_die('DeleteGroupPolicy', params);
    });

    var textbox = $('group-policy-textbox');
    listbox.removeItemAt(listbox.currentIndex);
    listbox.clearSelection();
    textbox.value = null;
  });
}

function refreshGroupPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;

  protect(function() {
    var xhr = inProgress(function() {
      return iamcli.query_or_die('ListGroupPolicies', [['GroupName', groupName]]);
    });

    var listbox = $('group-policy-listbox');
    var textbox = $('group-policy-textbox');
    var policyNames = [];

    for each (var member in xhr.xml()..PolicyNames.member) {
      policyNames.push(member);
    }

    listbox.clearSelection();
    textbox.value = null;
    disableUpdateButton();

    for (var i = listbox.itemCount - 1; i >= 0; i--) {
      listbox.removeItemAt(i);
    }

    for (var i = 0; i < policyNames.length; i++) {
      var policyName = policyNames[i];
      listbox.appendItem(policyName, policyName);
    }
  });
}

function updateGroupPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;

  var listbox = $('group-policy-listbox');
  var textbox = $('group-policy-textbox');

  var item = listbox.selectedItem;

  if (!item || !item.value) {
    return;
  }

  var policyName = item.value;
  var policyDocument = (textbox.value || '').trim();

  protect(function() {
    inProgress(function() {
      var params = [
        ['GroupName', groupName],
        ['PolicyName', policyName],
        ['PolicyDocument', policyDocument]
        ];

      iamcli.query_or_die('PutGroupPolicy', params);
    });

    textbox.value = policyDocument;
    disableUpdateButton();
  });
}

function enableUpdateButton() {
  $('group-policy-update-button').disabled = false;
}

function disableUpdateButton() {
  $('group-policy-update-button').disabled = true;
}

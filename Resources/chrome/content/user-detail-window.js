function windowOnLoad() {
  var args = window.arguments[0];
  document.title = 'Policies - ' + args.userName;
  var listbox = $('user-policy-listbox');
  refreshUserPolicy();
}

function listboxOnSelect(event) {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var item = event.currentTarget;

  if (!item || !item.value) {
    return;
  }

  var textbox = $('user-policy-textbox');

  var policyName = item.value;

  protect(function() {
    inProgress(function() {
      var params =  [['UserName', userName], ['PolicyName', policyName]];
      var xhr = iamcli.query_or_die('GetUserPolicy', params);

      var policy = xhr.xml().GetUserPolicyResult;
      textbox.value = decodeURIComponent(policy.PolicyDocument);
      disableUpdateButton();
    });
  });
}

function inProgress(callback) {
  var loader = $('user-policy-loader');
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

function addUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var policyName = prompt('Policy Name');
  policyName = (policyName || '').trim();

  if (policyName.length < 1) {
    return;
  }

  var listbox = $('user-policy-listbox');

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
        ['UserName', userName],
        ['PolicyName', policyName],
        ['PolicyDocument', POLICY_ALLOW_ALL]
        ];

      iamcli.query_or_die('PutUserPolicy', params);
    });

    var textbox = $('user-policy-textbox');
    var item = listbox.appendItem(policyName, policyName);
    listbox.selectItem(item);
    textbox.value = POLICY_ALLOW_ALL;
    disableUpdateButton();
  });
}

function deleteUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var listbox = $('user-policy-listbox');
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
      var params = [['UserName', userName], ['PolicyName', policyName]];
      iamcli.query_or_die('DeleteUserPolicy', params);
    });

    var textbox = $('user-policy-textbox');
    listbox.removeItemAt(listbox.currentIndex);
    listbox.clearSelection();
    textbox.value = null;
    disableUpdateButton();
  });
}

function refreshUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  protect(function() {
    var xhr = inProgress(function() {
      return iamcli.query_or_die('ListUserPolicies', [['UserName', userName]]);
    });

    var listbox = $('user-policy-listbox');
    var textbox = $('user-policy-textbox');
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

function updateUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var listbox = $('user-policy-listbox');
  var textbox = $('user-policy-textbox');

  var item = listbox.selectedItem;

  if (!item || !item.value) {
    return;
  }

  var policyName = item.value;
  var policyDocument = (textbox.value || '').trim();

  protect(function() {
    inProgress(function() {
      var params = [
        ['UserName', userName],
        ['PolicyName', policyName],
        ['PolicyDocument', policyDocument]
        ];

      iamcli.query_or_die('PutUserPolicy', params);
    });

    textbox.value = policyDocument;
    disableUpdateButton();
  });
}

function enableUpdateButton() {
  $('user-policy-update-button').disabled = false;
}

function disableUpdateButton() {
  $('user-policy-update-button').disabled = true;
}

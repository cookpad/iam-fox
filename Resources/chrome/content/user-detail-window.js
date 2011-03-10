function windowOnLoad() {
  var args = window.arguments[0];
  document.title = 'User - ' + args.userName;
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
  var xhr = null;

  protect(function() {
    inProgress(function() {
      var params =  [['UserName', userName], ['PolicyName', policyName]];
      xhr = iamcli.query('GetUserPolicy', params);
    });
  });

  if_xhr_success(xhr, function() {
    var policy = xhr.xml().GetUserPolicyResult;
    textbox.value = decodeURIComponent(policy.PolicyDocument);
  });
}

function inProgress(callback) {
  var progressmeter = $('user-policy-progressmeter');
  var retval = null;
  var exception = null;

  progressmeter.mode = 'undetermined';
  progressmeter.value = 0;

  try {
    retval = callback();
  } catch (e) {
    exception = e;
  }

  progressmeter.mode = 'determined';
  progressmeter.value = 100;

  if (exception) {
    throw exception;
  }

  return retval;
}

function addUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;
  var xhr = null;

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

      xhr = iamcli.query('PutUserPolicy', params);
    });
  });

  if_xhr_success(xhr, function() {
    var textbox = $('user-policy-textbox');

    var item = listbox.appendItem(policyName, policyName);
    listbox.selectItem(item);
    textbox.value = POLICY_ALLOW_ALL;
  });
}

function deleteUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;
  var xhr = null;

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
      xhr = iamcli.query('DeleteUserPolicy', params);
    });
  });

  if_xhr_success(xhr, function() {
    var textbox = $('user-policy-textbox');

    listbox.removeItemAt(listbox.currentIndex);
    listbox.clearSelection();
    textbox.value = null;
  });
}

function refreshUserPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;
  var xhr = null;

  protect(function() {
    inProgress(function() {
      xhr = iamcli.query('ListUserPolicies', [['UserName', userName]]);
    });
  });

  if_xhr_success(xhr, function() {
    var listbox = $('user-policy-listbox');
    var textbox = $('user-policy-textbox');
    var policyNames = [];

    for each (var member in xhr.xml()..PolicyNames.member) {
      policyNames.push(member);
    }

    listbox.clearSelection();
    textbox.value = null;

    for (var i = listbox.itemCount - 1; i >= 0; i--) {
      listbox.removeItemAt(i);
    }

    for (var i = 0; i < policyNames.length; i++) {
      var policyName = policyNames[i];
      listbox.appendItem(policyName, policyName);
    }
  });
}

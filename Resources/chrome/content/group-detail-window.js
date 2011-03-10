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

  var textbox = document.getElementById('group-policy-textbox');

  var policyName = item.value;
  var xhr = null;

  protect(function() {
    inProgress(function() {
      var params =  [['GroupName', groupName], ['PolicyName', policyName]];
      xhr = iamcli.query('GetGroupPolicy', params);
    }.bind(this));
  }.bind(this));

  if (xhr.success()) {
    var policy = xhr.xml().GetGroupPolicyResult;
    textbox.value = decodeURIComponent(policy.PolicyDocument);
  } else {
    alert(xhr.responseText);
  }
}

function inProgress(callback) {
  var progressmeter = document.getElementById('group-policy-progressmeter');
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

  protect(function() {
    inProgress(function() {
      var params = [
        ['GroupName', groupName],
        ['PolicyName', policyName],
        ['PolicyDocument', POLICY_ALLOW_ALL]
        ];

      xhr = iamcli.query('PutGroupPolicy', params);
    }.bind(this));
  }.bind(this));

  if (xhr.success()) {
    var listbox = document.getElementById('group-policy-listbox');
    var textbox = document.getElementById('group-policy-textbox');

    var item = listbox.appendItem(policyName, policyName);
    listbox.selectItem(item);
    textbox.value = POLICY_ALLOW_ALL;
  } else {
    alert(xhr.responseText);
  }
}

function deleteGroupPolicy() {
}

function refreshGroupPolicy() {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;
  var xhr = null;

  protect(function() {
    inProgress(function() {
      xhr = iamcli.query('ListGroupPolicies', [['GroupName', groupName]]);
    }.bind(this));
  }.bind(this));

  if (xhr.success()) {
    var listbox = document.getElementById('group-policy-listbox');
    var textbox = document.getElementById('group-policy-textbox');
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
  } else {
    alert(xhr.responseText);
  }
}

function windowOnLoad() {
  var args = window.arguments[0];
  document.title = 'Group - ' + args.groupName;
  var listbox = document.getElementById('group-policy-listbox');

  for (var i = 0; i < args.policyNames.length; i++) {
    var policyName = args.policyNames[i];
    listbox.appendItem(policyName, policyName);
  }
}

function listboxOnSelect(event) {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var groupName = args.groupName;

  var item = event.currentTarget;
  var textbox = document.getElementById('group-policy-textbox');

  var policyName = item.value;
  var policy = null;

  protect(function() {
    inProgress(function() {
      var params =  [['GroupName', groupName], ['PolicyName', policyName]];
      var getGroupPolicy = iamcli.query('GetGroupPolicy', params);
      policy = getGroupPolicy.xml().GetGroupPolicyResult;
    }.bind(this));
  }.bind(this));

  textbox.value = decodeURIComponent(policy.PolicyDocument);
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

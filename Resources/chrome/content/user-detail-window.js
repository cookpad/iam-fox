function windowOnLoad() {
  var args = window.arguments[0];
  document.title = 'User - ' + args.userName;
  var listbox = $('user-policy-listbox');

  for (var i = 0; i < args.policyNames.length; i++) {
    var policyName = args.policyNames[i];
    listbox.appendItem(policyName, policyName);
  }
}

function listboxOnSelect(event) {
  var args = window.arguments[0];
  var iamcli = args.iamcli;
  var userName = args.userName;

  var item = event.currentTarget;
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

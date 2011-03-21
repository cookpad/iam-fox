function windowOnLoad() {
}

function serverCertAddWindowDoOK() {
  try {
  var args = window.arguments[0];
  var view = args.selectedView();
  var iamcli = view.iamcli;
  var inProgress = args.inProgress;

  var serverCertName = ($('server-cert-add-window-server-cert-name').value || '').trim();
  var serverCertPath = ($('server-cert-add-window-path').value || '').trim();
  var serverCertBody = ($('server-cert-add-window-main-cert').value || '').trim();
  var serverPrivateKey = ($('server-cert-add-window-private-key').value || '').trim();
  var serverCertChain = ($('server-cert-add-window-chain-cert').value || '').trim();

  if (!serverCertName || !serverCertPath || !serverCertBody || !serverPrivateKey) {
    alert("Please input 'Server Certificate Name' and 'Path' and 'Certificate' and 'Private Key'.");
    return false;
  }

  window.close();

  if (serverCertPath.charAt(serverCertPath.length - 1) != '/') {
    serverCertPath += '/';
  }

  protect(function() {
    inProgress(function() {
      var params = [
        ['CertificateBody', serverCertBody],
        ['Path', serverCertPath],
        ['PrivateKey', serverPrivateKey],
        ['ServerCertificateName', serverCertName]
        ];

      if (serverCertChain) {
        params.push(['CertificateChain', serverCertChain]);
      }

      iamcli.query_or_die('UploadServerCertificate', params);

      view.refresh();
      view.selectByName(serverCertName);
    });
  });
  } catch(e) { alert(e); }

  return true;
}

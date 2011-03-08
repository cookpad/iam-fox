function IAMClient(accessKeyId, secretAccessKey) {
  this.accessKeyId = accessKeyId;
  this.secretAccessKey = secretAccessKey;
}

IAMClient.prototype = {
  USER_AGENT: 'IAMClient/0.1.0',
  API_VERSION: '2010-05-08',
  HOST: 'iam.amazonaws.com',
  TIMEOUT: 30000,

  query: function (action, params, callback, async) {
    if (!params) {
      params = [];
    }

    var queryString = this.makeQuery(action, params);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://' + this.HOST + '/', async);
    xhr.setRequestHeader('User-Agent', this.USER_AGENT);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Content-Length', queryString.length);
    xhr.setRequestHeader('Connection', 'close');

    function extxhr() {
      xhr.success = function() {
        return (xhr.status >= 200 && xhr.status < 300);
      }

      xhr.callback = function(xhr) {
        callback && callback(xhr);
      }

      xhr.xml = function() {
        var xml = new XML(xhr.responseText.replace(/xmlns="[^"]*"/, '')); // "
        return xml;
      }

      return xhr;
    }

    if (async) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) { return; }
        try {
          extxhr().callback();
        } catch (e) {
          alert(e);
        }
      };
    } else {
      xhr.onreadystatechange = function() {};
    }

    var timer = setTimeout(xhr.abort, this.TIMEOUT);

    try {
      xhr.send(queryString);
      clearTimeout(timer);
    } catch(e) {
      if (!async) { clearTimeout(timer); }
      throw e;
    }

    return extxhr();
  }, // query

  makeQuery: function(action, params) {
    var kvs = [];

    kvs.push(['Action', action]);
    kvs.push(['Version', this.API_VERSION]);
    kvs.push(['SignatureVersion', '2']);
    kvs.push(['SignatureMethod', 'HmacSHA1']);
    kvs.push(['Timestamp', this.timestamp()]);
    kvs.push(['AWSAccessKeyId', this.accessKeyId]);

    for each (var param in params) {
      kvs.push(param);
    }

    kvs.sort(function(a, b) {
      a = a[0]; b = b[0];
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    });

    var queryParams = [];

    for each (var kv in kvs) {
      var key = kv[0];
      var val = encodeURIComponent(kv[1]);
      queryParams.push(key + '=' + val);
    }

    var queryString = queryParams.join('&');
    var stringToSign = 'POST\n' + this.HOST + '\n/\n' + queryString;

    var signature = b64_hmac_sha1(this.secretAccessKey, stringToSign);
    queryString += '&Signature=' + encodeURIComponent(signature);

    return queryString;
  }, // makeQuery

  timestamp: function(date) {
    if (!date) {
      date = new Date();
    }

    function pad(num) {
      return (num < 10 ? '0' : '') + num;
    }

    var year = pad(date.getUTCFullYear());
    var mon  = pad(date.getUTCMonth() + 1);
    var day  = pad(date.getUTCDate());
    var hour = pad(date.getUTCHours());
    var min  = pad(date.getUTCMinutes());
    var sec  = pad(date.getUTCSeconds());

    return [year, mon, day].join('-') + 'T' + [hour, min, sec].join(':') + 'Z';
  } // timestamp
}; // IAMClient

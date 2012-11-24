// Generated by CoffeeScript 1.4.0
(function() {

  $(document).ready(function() {
    $('#slider').cycle({
      fx: 'fade',
      timeout: 7200,
      random: 1
    });
    return $.get('https://api.github.com/repos/zh99998/mycard/downloads', function(data) {
      var download, url, v, version, _i, _len;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        download = data[_i];
        if (v = download.name.match(/mycard-(.*)-win32\.7z/)) {
          if (!version || v[1] > version) {
            version = v[1];
            url = download.html_url;
          }
        }
      }
      if (version) {
        $('#download_url').attr('href', url);
        return $('#download_version').html(version);
      } else {
        return $('#download_version').html('读取失败');
      }
    });
  });

}).call(this);

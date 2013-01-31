// Generated by CoffeeScript 1.4.0
(function() {
  var Room, Rooms, Server, Servers, login, logout,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Server = (function(_super) {

    __extends(Server, _super);

    function Server() {
      return Server.__super__.constructor.apply(this, arguments);
    }

    Server.configure("Server", "name", "ip", "port", "index");

    Server.extend(Spine.Model.Ajax);

    Server.url = "/servers.json";

    Server.choice = function(auth, pvp) {
      var s, servers;
      if (auth == null) {
        auth = true;
      }
      if (pvp == null) {
        pvp = false;
      }
      servers = pvp ? Server.findAllByAttribute('pvp', true) : Server.all();
      s = _.filter(servers, function(server) {
        return _.find($('#servers').multiselect('getChecked'), function(e) {
          return parseInt(e.value) === server.id;
        });
      });
      if (s.length) {
        servers = s;
      }
      return servers[Math.floor(Math.random() * servers.length)];
    };

    return Server;

  })(Spine.Model);

  Servers = (function(_super) {

    __extends(Servers, _super);

    function Servers() {
      this.connect = __bind(this.connect, this);

      this.render = __bind(this.render, this);
      Servers.__super__.constructor.apply(this, arguments);
      Server.bind("refresh", this.render);
      Server.one("refresh", this.connect);
    }

    Servers.prototype.render = function() {
      this.html($('#server_template').tmpl(Server.all()));
      this.el.multiselect({
        noneSelectedText: '房间筛选',
        selectedText: '房间筛选',
        header: false,
        minWidth: 'auto',
        classes: 'server_filter'
      }).bind("multiselectclick", function(event, ui) {
        return Room.trigger('refresh');
      });
      $('#server option[value!=0]').remove();
      return Server.each(function(server) {
        return $('<option />', {
          label: server.name,
          value: server.id
        }).appendTo($('#server'));
      });
    };

    Servers.prototype.connect = function() {
      var websocket, wsServer;
      wsServer = 'ws://mycard-server.my-card.in:9998';
      websocket = new WebSocket(wsServer);
      websocket.onopen = function() {
        return console.log("websocket: Connected to WebSocket server.");
      };
      websocket.onclose = function() {
        return console.log("websocket: Disconnected");
      };
      websocket.onmessage = function(evt) {
        var room, rooms, _i, _len;
        rooms = JSON.parse(evt.data);
        for (_i = 0, _len = rooms.length; _i < _len; _i++) {
          room = rooms[_i];
          if (room._deleted) {
            if (Room.exists(room.id)) {
              Room.find(room.id).destroy();
            }
          }
        }
        return Room.refresh((function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = rooms.length; _j < _len1; _j++) {
            room = rooms[_j];
            if (!room._deleted) {
              _results.push(room);
            }
          }
          return _results;
        })());
      };
      return websocket.onerror = function(evt) {
        return console.log('websocket: Error occured: ' + evt.data);
      };
    };

    return Servers;

  })(Spine.Controller);

  Room = (function(_super) {

    __extends(Room, _super);

    function Room() {
      return Room.__super__.constructor.apply(this, arguments);
    }

    Room.configure("Room", "name", "status", "private", "rule", "mode", "start_lp");

    Room.belongsTo('server', Server);

    return Room;

  })(Spine.Model);

  Rooms = (function(_super) {

    __extends(Rooms, _super);

    Rooms.prototype.events = {
      'click .room': 'clicked'
    };

    function Rooms() {
      this.render = __bind(this.render, this);
      Rooms.__super__.constructor.apply(this, arguments);
      Room.bind("refresh", this.render);
    }

    Rooms.prototype.render = function() {
      return this.html($('#room_template').tmpl(_.sortBy(_.filter(Room.all(), this.filter), this.sort)));
    };

    Rooms.prototype.filter = function(room) {
      return _.find($('#servers').multiselect('getChecked'), function(e) {
        return parseInt(e.value) === room.server_id;
      });
    };

    Rooms.prototype.sort = function(room) {
      return [room.status === "wait" ? 0 : 1, room["private"]];
    };

    Rooms.prototype.clicked = function(e) {
      var room;
      room = $(e.target).tmplItem().data;
      if (room["private"]) {
        $('#join_private_room')[0].reset();
        $('#join_private_room').data('room_id', room.id);
        return $('#join_private_room_dialog').dialog('open');
      } else {
        return mycard.join(room.server().ip, room.server().port, mycard.room_name(room.name, null, room.pvp, room.rule, room.mode, room.start_lp), Candy.Util.getCookie('username'), room.server().auth ? Candy.Util.getCookie('password') : void 0);
      }
    };

    return Rooms;

  })(Spine.Controller);

  login = function() {
    var candy_height;
    Candy.init('http://s70.hebexpo.com:5280/http-bind/', {
      core: {
        debug: false,
        autojoin: ['mycard@conference.my-card.in']
      },
      view: {
        resources: '/vendor/candy/res/',
        language: 'cn'
      }
    });
    Candy.Util.getPosTopAccordingToWindowBounds = function(elem, pos) {
      var backgroundPositionAlignment, elemHeight, marginDiff, relative, windowHeight;
      windowHeight = $(document).height();
      elemHeight = elem.outerHeight();
      marginDiff = elemHeight - elem.outerHeight(true);
      backgroundPositionAlignment = 'top';
      pos -= relative = $('#candy').offset().top;
      if (pos + elemHeight >= windowHeight - relative) {
        pos -= elemHeight - marginDiff;
        backgroundPositionAlignment = 'bottom';
      }
      return {
        px: pos,
        backgroundPositionAlignment: backgroundPositionAlignment
      };
    };
    CandyShop.InlineImages.init();
    Candy.View.Template.Login.form = $('#login_form_template').html();
    Candy.Util.setCookie('candy-nostatusmessages', '1', 365);
    Candy.Core.connect(Candy.Util.getCookie('jid'), Candy.Util.getCookie('password'));
    Candy.View.Pane.Roster.joinAnimation = function(elementId) {
      return $('#' + elementId).show().css('opacity', 1);
    };
    $('.xmpp').click(function() {
      return Candy.View.Pane.PrivateRoom.open($(this).data('jid'), $(this).data('nick'), true, true);
    });
    window.onbeforeunload = null;
    candy_height = $('#candy').outerHeight(true);
    $('.card_center').css('margin-bottom', -candy_height);
    $('.card_center').css('padding-bottom', candy_height);
    $('#candy').show();
    $('.xmpp').click(function() {
      return Candy.View.Pane.PrivateRoom.open($(this).data('jid'), $(this).data('nick'), true, true);
    });
    return $('#roster').show();
  };

  logout = function() {
    Candy.Util.deleteCookie('jid');
    Candy.Util.deleteCookie('username');
    Candy.Util.deleteCookie('password');
    return window.location.reload();
  };

  $(document).ready(function() {
    var new_room, rooms, servers;
    if (Candy.Util.getCookie('jid')) {
      login();
      if (Candy.Util.getCookie('password')) {
        $('#current_username').html(Candy.Util.getCookie('username'));
        $('.log_reg.not_logged').hide();
        $('.log_reg.logged').show();
      }
    }
    $('#new_room_dialog').dialog({
      autoOpen: false,
      resizable: false,
      title: "建立/加入房间"
    });
    $('#join_private_room_dialog').dialog({
      autoOpen: false,
      resizable: false,
      title: "加入私密房间"
    });
    new_room = $('#new_room')[0];
    new_room.pvp.onchange = function() {
      var server_id;
      if (this.checked) {
        if (new_room.mode.value === '2') {
          new_room.mode.value = 1;
        }
        new_room.rule.value = 0;
        new_room.start_lp.value = 8000;
        if ((server_id = parseInt(new_room.server.value)) && !Server.find(server_id).pvp) {
          return new_room.server.value = Server.choice(false, new_room.pvp.ckecked).id;
        }
      }
    };
    new_room.mode.onchange = function() {
      if (this.value === '2') {
        return new_room.pvp.checked = false;
      }
    };
    new_room.rule.onchange = function() {
      if (this.value !== '0') {
        return new_room.pvp.checked = false;
      }
    };
    new_room.start_lp.onchange = function() {
      if (this.value !== '8000') {
        return new_room.pvp.checked = false;
      }
    };
    new_room.server.onchange = function() {
      var server_id;
      $('#server_custom').hide();
      if (server_id = parseInt(new_room.server.value)) {
        if (!Server.find(server_id).pvp) {
          return new_room.pvp.checked = false;
        }
      } else {
        return $('#server_custom').show();
      }
    };
    new_room.onsubmit = function(ev) {
      var server, server_auth, server_id, server_ip, server_port;
      ev.preventDefault();
      $('#new_room_dialog').dialog('close');
      if (server_id = parseInt(new_room.server.value)) {
        server = Server.find(server_id);
        server_ip = server.ip;
        server_port = server.port;
        server_auth = server.auth;
      } else {
        server_ip = new_room.server_ip.value;
        server_port = parseInt(new_room.server_port.value);
        server_auth = new_room.server_auth.checked;
      }
      return mycard.join(server_ip, server_port, mycard.room_name(this.name.value, this.password.value, this.pvp.checked, parseInt(this.rule.value), parseInt(this.mode.value), parseInt(this.start_lp.value)), Candy.Util.getCookie('username'), server_auth ? Candy.Util.getCookie('password') : void 0);
    };
    $('#join_private_room').submit(function(ev) {
      var room, room_id;
      ev.preventDefault();
      $('#join_private_room_dialog').dialog('close');
      if (this.password.value) {
        room_id = $(this).data('room_id');
        if (Room.exists(room_id)) {
          room = Room.find(room_id);
          return mycard.join(room.server().ip, room.server().port, mycard.room_name(room.name, this.password.value, room.pvp, room.rule, room.mode, room.start_lp), Candy.Util.getCookie('username'), room.server().auth ? Candy.Util.getCookie('password') : void 0);
        } else {
          return alert('房间已经关闭');
        }
      }
    });
    $('#new_room_button').click(function() {
      new_room.name.value = Math.floor(Math.random() * 1000);
      new_room.server.value = Server.choice(false, new_room.pvp.ckecked).id;
      new_room.server.onchange();
      return $('#new_room_dialog').dialog('open');
    });
    $('#login_button').click(function() {
      return login();
    });
    $('#logout_button').click(function() {
      return logout();
    });
    rooms = new Rooms({
      el: $('#rooms')
    });
    servers = new Servers({
      el: $('#servers')
    });
    return Server.fetch();
  });

}).call(this);

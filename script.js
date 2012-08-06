
var jsdom = require('jsdom');
var id = '1240';

jsdom.env('http://www.ding.eu/ding2/XML_DM_REQUEST?' +
          'laguage=de&typeInfo_dm=stopID&' +
          'nameInfo_dm=900' + id +
          '&deleteAssignedStops_dm=1&useRealtime=1&mode=direct',
          ['http://code.jquery.com/jquery.min.js'],
          function (error, win) {
              var $ = win.$;
              $('itdDepartureList itdDeparture').each(function (index, child) {
                  var departure = {
                      platform: $(child).attr('platform'),
                      stopID: $(child).attr('stopID'),
                      countdown: $(child).attr('countdown'),
                      isRealTime: true
                  };
                  var servLine = $(child).find('itdServingLine');
                  departure.direction = servLine.attr('direction');
                  departure.realtime = servLine.attr('realtime');
                  departure.line = servLine.attr('number');
                  var dateTime = $(child).find('itdRTDateTime');
                  if (dateTime.length === 0) {
                      departure.isRealTime = false;
                      dateTime = $(child).find('itdDateTime');
                  }
                  var date = $(dateTime).find('itdDate');
                  var time = $(dateTime).find('itdTime');
                  departure.dateTime = new Date(Number(date.attr('year')),
                                                Number(date.attr('month')),
                                                Number(date.attr('day')),
                                                Number(time.attr('hour')),
                                                Number(time.attr('minute')),
                                                0, 0);
                  departure.dateTime = Number(departure.dateTime);
                  console.log(departure);
              });
          });

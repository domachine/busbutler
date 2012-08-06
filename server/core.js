var jsdom = require('jsdom'),
    nano = require('nano')('http://localhost:5984/haltestellen');

exports.update = function (doc) {
    var id = doc._id.substring(4);
    jsdom.env('http://www.ding.eu/ding2/XML_DM_REQUEST?' +
              'laguage=de&typeInfo_dm=stopID&' +
              'nameInfo_dm=' + id +
              '&deleteAssignedStops_dm=1&useRealtime=1&mode=direct',
              ['http://code.jquery.com/jquery.min.js'],
              function (error, win) {
                  if (error) {
                      console.log(error);
                  }
                  else {
                      var $ = win.$;
                      var deps = [];
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
                          deps.push(departure);
                      });
                      doc.departures = deps;
                      updateDoc(doc);
                  }
              });
};

function updateDoc (doc) {
    nano.bulk({docs: [doc]}, function (err) {
        if (err) {
            console.log('Error occured:');
            console.log(err);
        }
    });
}

// nano.get('_all_docs', {include_docs: true}, function (err, res) {
//     res.rows.forEach(function (row) {
//         update(row.doc);
//     });
// });

var jsdom = require('jsdom');
var request = require('request');
var libxml = require('libxmljs');

function parseXML (doc, callback, nano, err, res, xml) {
    var $ = libxml.parseXmlString(xml);
    var deps = [];
    $.find('//itdDepartureList/itdDeparture').forEach(function (child) {
        var departure = {
            platform: child.attr('platform').value(),
            stopID: child.attr('stopID').value(),
            countdown: child.attr('countdown').value(),
            isRealTime: true
        };
        var servLine = child.find('//itdServingLine')[0];
        departure.direction = servLine.attr('direction').value();
        departure.realtime = servLine.attr('realtime').value();
        departure.line = servLine.attr('number').value();
        var dateTime = child.find('//itdRTDateTime');
        if (dateTime.length === 0) {
            departure.isRealTime = false;
            dateTime = child.find('//itdDateTime')[0];
        }
        else
            dateTime = dateTime[0];
        var date = dateTime.find('//itdDate')[0];
        var time = dateTime.find('itdTime')[0];
        departure.dateTime = new Date(Number(date.attr('year').value()),
                                      Number(date.attr('month').value()),
                                      Number(date.attr('day').value()),
                                      Number(time.attr('hour').value()),
                                      Number(time.attr('minute').value()),
                                      0, 0);
        departure.dateTime = Number(departure.dateTime);
        deps.push(departure);
    });
    doc.departures = deps;
    doc.lastUpdate =
        Number(new Date($.find('//itdRequest')[0].attr('now').value()
                        + '+0200'));
    callback(null, doc);
    nano.bulk({docs: [doc]}, function (err) {
        if (err) {
            console.log('Error occured:');
            console.log(err);
        }
        else
            console.log('Wrote record to database');
    });
}

exports.update = function (doc, callback, nano) {
    var id = doc._id.substring(4);
    request({url:'http://www.ding.eu/ding2/XML_DM_REQUEST?' +
             'laguage=de&typeInfo_dm=stopID&' +
             'nameInfo_dm=' + id +
             '&deleteAssignedStops_dm=1&useRealtime=1&mode=direct',
             encoding: 'binary'},
            function (err, res, xml) {
                if (err)
                    callback(err);
                else
                    parseXML(doc, callback, nano, err, res, xml);
            });
};

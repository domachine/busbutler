/*
 * File: app/view/Root.js
 *
 * This file was generated by Sencha Architect version 2.0.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Sencha Touch 2.0.x library, under independent license.
 * License of Sencha Architect does not include license for Sencha Touch 2.0.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('MyApp.view.Root', {
    extend: 'Ext.Container',

    config: {
        id: 'root',
        layout: {
            type: 'card'
        },
        items: [
            {
                xtype: 'list',
                id: 'stationList',
                itemId: 'mylist',
                itemTpl: [
                    '<div>{key}</div>'
                ],
                store: 'stations',
                grouped: true,
                indexBar: true,
                items: [
                    {
                        xtype: 'toolbar',
                        docked: 'top',
                        items: [
                            {
                                xtype: 'searchfield',
                                id: 'mysearchfield',
                                itemId: 'mysearchfield',
                                label: ''
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'list',
                id: 'departureTimeList',
                itemId: 'mylist1',
                itemTpl: [
                    '<div>{line} {direction} in {countdown} min</div>'
                ],
                store: 'departureTimes',
                items: [
                    {
                        xtype: 'toolbar',
                        docked: 'top',
                        items: [
                            {
                                xtype: 'button',
                                itemId: 'mybutton',
                                text: 'zur Übersicht'
                            }
                        ]
                    }
                ],
                listeners: [
                    {
                        fn: function(component, options) {
                            /*var id = this.stationId;
                            console.info(this);
                            var reloadTask = Ext.create('Ext.util.DelayedTask', function() {
                            Ext.getCmp("departureTimeList").getStore().load({
                            params: {
                            id: id
                            }
                            });
                            reloadTask.delay(10 * 1000);
                            });
                            reloadTask.delay(10 * 1000);*/
                        },
                        event: 'initialize'
                    }
                ]
            }
        ],
        listeners: [
            {
                fn: 'onMysearchfieldKeyup',
                event: 'keyup',
                delegate: '#mysearchfield'
            },
            {
                fn: 'onMysearchfieldClearicontap',
                event: 'clearicontap',
                delegate: '#mysearchfield'
            },
            {
                fn: 'onMylistSelect',
                event: 'select',
                delegate: '#stationList'
            },
            {
                fn: 'onMybuttonTap',
                event: 'tap',
                delegate: '#mybutton'
            },
            {
                fn: 'onDepartureTimeListUpdateList',
                event: 'updateList',
                delegate: '#departureTimeList'
            },
            {
                fn: 'onRootChangeList',
                event: 'changeList'
            },
            {
                fn: 'onRootInitialize',
                event: 'initialize'
            },
            {
                fn: 'onRootGeopositionChangeD',
                event: 'geopositionChanged'
            }
        ]
    },

    onMysearchfieldKeyup: function(textfield, e, options) {
        if(this.filterTask === undefined)
        this.filterTask = new Ext.util.DelayedTask(this.executeSearch, this);

        this.filterTask.delay(300);
    },

    onMysearchfieldClearicontap: function(text, e, options) {
        if(this.filterTask === undefined)
        this.filterTask = new Ext.util.DelayedTask(this.executeSearch, this);

        this.filterTask.delay(0);
    },

    onMylistSelect: function(dataview, record, options) {
        Ext.getCmp("root").fireEvent("changeList", Ext.getCmp("departureTimeList"));
        Ext.getCmp("departureTimeList").fireEvent("updateList", record.get("value"));
    },

    onMybuttonTap: function(button, e, options) {
        Ext.getCmp("stationList").deselectAll();
        Ext.getCmp("root").fireEvent("changeList", Ext.getCmp("stationList"));
    },

    onDepartureTimeListUpdateList: function(id) {
        //Ext.getCmp("departureTimeList").getStore().stationId = id;
        Ext.getCmp("departureTimeList").getStore().load({
            params: {
                id: id
            }
        });
    },

    onRootChangeList: function(card) {
        this.setActiveItem(card);
        /*
        TODO
        reload von aktuem departue list
        suche auf wildcard ändern
        */
    },

    onRootInitialize: function(component, options) {
        if(!navigator.geolocation){
            var stationID = localStorage.getItem("stationID");
            if(stationID === null)
            stationID = 1240;
            Ext.getCmp("stationfield").setValue(stationID);
        }else{
            //geolocation works
            navigator.geolocation.getCurrentPosition(
            function(position){
                component.fireEvent("geopositionChanged",{latitude: position.coords.latitude, longitude: position.coords.longitude});
            },
            function(){
                alert("Fehlerhafte Ortung.");
                alert(JSON.stringify(arguments));
            }
            );
        }

    },

    onRootGeopositionChangeD: function(opts, event) {
        var url = "/haltestellen/_design/view/_list/next/allByCoords?coords=" + JSON.stringify([opts.longitude, opts.latitude]);
        Ext.Ajax.request({
            url: url,
            headers: { 'Content-Type': 'application/json' },
            success: function(response){
                var text = JSON.parse(response.responseText);
                var stationsStore = Ext.getCmp("stationList").getStore();
                console.info(stationsStore);
                var stationModel = stationsStore.getModel();
                for(var i = 0; i < text.rows.length ; i++){
                    var station = new stationModel();
                    station.set("id", "fuu"+text.rows[i].id);
                    station.set("key", text.rows[i].location);
                    station.set("value", text.rows[i].oldid);
                    station.set("group", "1. Nächste Stationen");
                    stationsStore.add(station);
                }
            }
        });
    },

    executeSearch: function() {
        var search = Ext.getCmp("mysearchfield").getValue().split(" ");
        Ext.getCmp("stationList").getStore().clearFilter();
        Ext.getCmp("stationList").getStore().filterBy(
        function(record){
            var key = record.get("key");
            for(var i in search){
                if(key.toLowerCase().indexOf(search[i].toLowerCase()) === -1)
                return;
            }
            return key;
        }
        );
    }

});
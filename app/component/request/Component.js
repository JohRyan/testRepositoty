sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/resource/ResourceModel",
        "sap/ui/Device",
        "project1/model/models"
    ],
    function (UIComponent, JSONModel, ResourceModel, Device, models) {
        "use strict";

        return UIComponent.extend("project1.Component", {
            metadata: {
                "interfaces": ["sap.ui.core.IAsyncContentCreation"],
                "rootView": {
                    "viewName": "project1.view.View1",
                    "type": "XML",
                    "id": "View1"
                },
                manifest:"json"
                
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                var oData = {
                    recipient : {
                        name : "World"
                    }
                };

                var oModel = new JSONModel(oData);
                this.setModel(oModel);

                var i18nModel = new ResourceModel({
                    bundleName: "project1.i18n.i18n"
                });
                this.setModel(i18nModel, "i18n");

                // enable routing
                this.getRouter().initialize();
            }
        });
    }
);